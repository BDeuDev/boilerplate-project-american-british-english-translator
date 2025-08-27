const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require('./british-only.js');

class Translator {
    constructor() {
        this.americanOnly = americanOnly;
        this.americanToBritishSpelling = americanToBritishSpelling;
        this.americanToBritishTitles = americanToBritishTitles;
        this.britishOnly = britishOnly;
    }

    translate(text, locale) {
        if (!text || !locale) {
            return { error: 'Required field(s) missing' };
        }

        if (locale !== "american-to-british" && locale !== "british-to-american") {
            return { error: 'Invalid value for locale field' };
        }

        let translation = text;
        let changes = [];

        const highlight = (word) => `<span class="highlight">${word}</span>`;

        const replaceSafe = (str, regex, replacer) => {
            return str.replace(regex, (match, ...rest) => {
                if (match.includes('<span')) return match;
                return replacer(match, ...rest);
            });
        };

        const preserveCase = (original, replacement) => {
            if (/^[A-Z]/.test(original)) {
                return replacement.charAt(0).toUpperCase() + replacement.slice(1);
            }
            return replacement;
        };

        if (locale === "american-to-british") {
            const americanWords = Object.keys(this.americanOnly).sort((a, b) => b.length - a.length);
            for (let word of americanWords) {
                const regex = new RegExp(`\\b${word}\\b`, "gi");
                translation = replaceSafe(translation, regex, () => {
                    changes.push(word);
                    return highlight(this.americanOnly[word]);
                });
            }

            const spellings = Object.keys(this.americanToBritishSpelling).sort((a, b) => b.length - a.length);
            for (let word of spellings) {
                const regex = new RegExp(`\\b${word}\\b`, "gi");
                translation = replaceSafe(translation, regex, (match) => {
                    changes.push(word);
                    return highlight(preserveCase(match, this.americanToBritishSpelling[word]));
                });
            }

            for (let title in this.americanToBritishTitles) {
                const regex = new RegExp(`\\b${title.replace('.', '\\.')}(?=\\s|$)`, "gi");
                translation = replaceSafe(translation, regex, (match) => {
                    const replacement = preserveCase(match, this.americanToBritishTitles[title]);
                    changes.push(match);
                    return highlight(replacement);
                });
            }

            translation = replaceSafe(translation, /\b(\d{1,2}):(\d{2})\b/g, (match, h, m) => {
                changes.push(match);
                return highlight(`${h}.${m}`);
            });
        }

        if (locale === "british-to-american") {
            const britishWords = Object.keys(this.britishOnly).sort((a, b) => b.length - a.length);
            for (let word of britishWords) {
                const regex = new RegExp(`\\b${word}\\b`, "gi");
                translation = replaceSafe(translation, regex, () => {
                    changes.push(word);
                    return highlight(this.britishOnly[word]);
                });
            }

            const spellings = Object.keys(this.americanToBritishSpelling).sort((a, b) => b.length - a.length);
            for (let word of spellings) {
                const british = this.americanToBritishSpelling[word];
                const regex = new RegExp(`\\b${british}\\b`, "gi");
                translation = replaceSafe(translation, regex, (match) => {
                    changes.push(british);
                    return highlight(preserveCase(match, word));
                });
            }

            for (let title in this.americanToBritishTitles) {
                const british = this.americanToBritishTitles[title];
                const regex = new RegExp(`\\b${british}\\b`, "gi");
                translation = replaceSafe(translation, regex, (match) => {
                    const replacement = preserveCase(match, title);
                    changes.push(british);
                    return highlight(replacement);
                });
            }

            translation = replaceSafe(translation, /\b(\d{1,2})\.(\d{2})\b/g, (match, h, m) => {
                changes.push(match);
                return highlight(`${h}:${m}`);
            });
        }

        if (changes.length === 0) {
            return { text, translation: "Everything looks good to me!" };
        }

        return { text, translation };
    }
}

module.exports = Translator;
