export interface Question {
    a: number;
    b: number;
    correctAnswer: number;
    prompt: string;
}

export class PracticaEngine {
    // Generate a multiplication question
    generateQuestion(tables: number[]): Question {
        const a = tables[Math.floor(Math.random() * tables.length)];
        const b = Math.floor(Math.random() * 9) + 1; // 1 to 9
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
        const allPossible: Question[] = [];

        // Generate all possible operations for the selected tables (1 to 9)
        for (const a of tables) {
            for (let b = 1; b <= 9; b++) {
                allPossible.push({
                    a,
                    b,
                    correctAnswer: a * b,
                    prompt: `${a} x ${b}`,
                });
            }
        }

        // Shuffle the list
        const shuffled = allPossible.sort(() => Math.random() - 0.5);

        // Return the requested count (or all if count > available)
        return shuffled.slice(0, count);
    }

    // Generate options for choice mode
    generateOptions(currentQuestion: Question, count: number = 4): number[] {
        const correct = currentQuestion.correctAnswer;
        const options = new Set<number>();
        options.add(correct);

        // Generate "nearby" distractors
        const distractors = [
            correct - currentQuestion.a,
            correct + currentQuestion.a,
            correct - 1,
            correct + 1,
            correct - 2,
            correct + 2,
            (currentQuestion.a - 1) * currentQuestion.b,
            (currentQuestion.a + 1) * currentQuestion.b,
            currentQuestion.a * (currentQuestion.b - 1),
            currentQuestion.a * (currentQuestion.b + 1),
        ];

        const validDistractors = distractors.filter(d => d > 0 && d !== correct);

        // Shuffle valid distractors and add to options
        const shuffledDistractors = validDistractors.sort(() => Math.random() - 0.5);
        for (const d of shuffledDistractors) {
            if (options.size < count) {
                options.add(d);
            }
        }

        // If not enough bits, add random ones
        while (options.size < count) {
            const random = Math.floor(Math.random() * 81) + 1;
            if (random !== correct) {
                options.add(random);
            }
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
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
