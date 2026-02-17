/**
 * Calculates the Levenshtein distance between two strings.
 * This is used to detect misspellings (1 character difference).
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Returns a score for an answer:
 * 1.0 = Exact match
 * 0.5 = Misspelled (distance of 1)
 * 0.0 = Incorrect
 */
export function checkAnswerWithMisspelling(userAnswer: string, correctAnswer: string): number {
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    // Check for exact match first
    if (normalizedUser === normalizedCorrect) {
        return 1.0;
    }

    // Check for misspelling (if length > 2 to avoid too many false positives)
    if (normalizedUser.length > 2 && normalizedCorrect.length > 2) {
        const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
        if (distance === 1) {
            return 0.5;
        }
    }

    return 0.0;
}
