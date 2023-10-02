
export function process(sourceText: string, _sourcePath: string, _options: any) {
    return {
        code: `module.exports = "${sourceText}";`,
    };
}
