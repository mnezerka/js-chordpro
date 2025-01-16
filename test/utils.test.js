var utils = require('../src/utils');

describe('Transpose utility', function() {

    it('works for single chord', function () {
        // zero step
        expect(utils.transposeChord('C', 0)).toBe('C');

        // 2 steps up
        expect(utils.transposeChord('C', 2)).toBe('D');
        expect(utils.transposeChord('Cmi', 2)).toBe('Dmi');

        // step up from #
        expect(utils.transposeChord('F#', 1)).toBe('G');
        expect(utils.transposeChord('F#mi', 1)).toBe('Gmi');

        // step down to #
        expect(utils.transposeChord('G', -1)).toBe('F#');
        expect(utils.transposeChord('Gmi', -1)).toBe('F#mi');
    });

    it('works for multiple chords', function () {
        // 2 steps up
        expect(utils.transposeChord('C D E F G A B', 2)).toBe('D E F# G A B C#');

        // 2 steps down
        expect(utils.transposeChord('C D E F G A B', -2)).toBe('Bb C D Eb F G A');
    });

    it('works for alternative roots', function () {
        expect(utils.transposeChord('Db D# Gb G# A#', 1)).toBe('D E G A B');
    });

    it('works for complex chords', function () {
        expect(utils.transposeChord('Cm7/5-', 6)).toBe('F#m7/5-');
    });

    it('works for song', function () {

        let song = {
            content: [
                {
                    type: 'verse',
                    items: [
                        {
                            type: 'line',
                            items: [
                                {
                                    type: 'chord',
                                    value: 'C'
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        utils.transpose(song, 2);
    });

});
