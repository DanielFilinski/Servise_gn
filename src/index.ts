function getVerses(data: string): number[] {
    const verses: number[] = [];
    
    // Split the input by commas
    const parts = data.split(',');

    for (const part of parts) {
        let range = part.trim(); // Remove whitespace

        // Check for a range (e.g., "15–20")
        if (range.includes('–')) {
            const [start, end] = range.split('–').map(Number); // Split into start and end, convert to numbers
            for (let i = start; i <= end; i++) {
                verses.push(i); // Add all numbers in the range
            }
        } else {
            // Otherwise, just add the single number
            verses.push(Number(range));
        }
    }

    return verses; // Return the resulting array
}

// Example usage:
console.log(getVerses("10")); // [10]
console.log(getVerses("15–20")); // [15, 16, 17, 18, 19, 20]
console.log(getVerses("17, 18")); // [17, 18]