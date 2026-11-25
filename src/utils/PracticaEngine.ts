export interface Question {
    a: number;
    b: number;
    correctAnswer: number;
    prompt: string;
}

export interface PracticeMistake {
    a: number;
    b: number;
    answer: string;
    correctAnswer: number;
}

export class PracticaEngine {
    // Generate a multiplication question
    generateQuestion(tables: number[]): Question {
        const a = tables[Math.floor(Math.random() * tables.length)];
        const roll = Math.random();
        const b = roll < 0.05 ? 1 : roll < 0.1 ? 10 : this.weightedOperand();
        const correctAnswer = a * b;

        return {
            a,
            b,
            correctAnswer,
            prompt: `${a} x ${b}`,
        };
    }

    // Generate a set of unique questions
    generateUniqueQuestions(tables: number[], count: number): Question[] {
        const coreQuestions: Array<{ value: Question; weight: number }> = [];
        const occasionalQuestions: Question[] = [];

        for (const a of tables) {
            for (let b = 2; b <= 9; b++) {
                coreQuestions.push({
                    value: this.createQuestion(a, b),
                    weight: b >= 6 ? 3 : 1,
                });
            }
            occasionalQuestions.push(this.createQuestion(a, 1), this.createQuestion(a, 10));
        }

        if (coreQuestions.length >= count) {
            const weightedQuestions = [
                ...coreQuestions,
                ...occasionalQuestions.map(value => ({ value, weight: 0.15 })),
            ];
            return this.weightedShuffle(weightedQuestions).slice(0, count).map(item => item.value);
        }

        const prioritizedCore = this.weightedShuffle(coreQuestions);
        const remainingCount = count - prioritizedCore.length;

        if (remainingCount <= 0) {
            return prioritizedCore.map(item => item.value);
        }

        const occasional = this.shuffle(occasionalQuestions)
            .filter(() => Math.random() < 0.1)
            .slice(0, remainingCount);

        return [...prioritizedCore.map(item => item.value), ...occasional];
    }

    generateQuestionsFromMistakes(mistakes: PracticeMistake[]): Question[] {
        return mistakes.map(({ a, b, correctAnswer }) => this.createQuestion(a, b, correctAnswer));
    }

    private createQuestion(a: number, b: number, correctAnswer = a * b): Question {
        return {
            a,
            b,
            correctAnswer,
            prompt: `${a} x ${b}`,
        };
    }

    private weightedOperand(): number {
        const easy = [2, 3, 4, 5];
        const challenging = [6, 7, 8, 9];
        const weighted = [
            ...easy.map(value => ({ value, weight: 1 })),
            ...challenging.map(value => ({ value, weight: 3 })),
        ];
        return this.weightedShuffle(weighted)[0].value;
    }

    private shuffle<T>(items: T[]): T[] {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled;
    }

    private weightedShuffle<T>(items: Array<{ value: T; weight: number }>): Array<{ value: T; weight: number }> {
        return items
            .map(item => ({
                ...item,
                randomKey: -Math.log(Math.max(Math.random(), Number.EPSILON)) / item.weight,
            }))
            .sort((first, second) => first.randomKey - second.randomKey)
            .map(({ randomKey: _randomKey, ...item }) => item);
    }

    // Generate options for choice mode
    generateOptions(currentQuestion: Question, count: number = 4, practicedTables: number[] = [currentQuestion.a]): number[] {
        const correct = currentQuestion.correctAnswer;
        const options = new Set<number>();
        options.add(correct);
        const correctIsOdd = correct % 2 !== 0;

        const tableProducts = practicedTables.flatMap(table =>
            Array.from({ length: 10 }, (_, index) => table * (index + 1)),
        );
        const nearbyAnswers = [-6, -4, -2, 2, 4, 6].map(offset => correct + offset);
        const distractors = [...tableProducts, ...nearbyAnswers]
            .filter(answer => answer > 0 && (answer % 2 !== 0) === correctIsOdd);

        for (const answer of this.shuffle(distractors)) {
            if (options.size < count) {
                options.add(answer);
            }
        }

        // Keep generated alternatives plausible and preserve the answer's parity.
        while (options.size < count) {
            const random = Math.floor(Math.random() * 50) * 2 + (correctIsOdd ? 1 : 2);
            options.add(random);
        }

        return this.shuffle(Array.from(options));
    }

    // Check the answer (strict hit only)
    checkAnswer(question: Question, userAnswer: string | number): boolean {
        const answer = typeof userAnswer === 'string' ? parseInt(userAnswer, 10) : userAnswer;
        return answer === question.correctAnswer;
    }

    getCorrectAnswer(question: Question): string {
        return question.correctAnswer.toString();
    }
}
