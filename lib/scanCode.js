import fs from "fs";
import path from "path";
import esprima from "esprima";

async function scanCode(source) {
    const sourcePath = path.resolve(source);

    if (!fs.existsSync(sourcePath)) {
        throw new Error("Source path does not exist.");
    }

    let docsData = "";

    function scanDirectory(dirPath) {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                scanDirectory(filePath);
            } else if (stats.isFile() && path.extname(file).toLowerCase() === '.js') {
                try {
                    const code = fs.readFileSync(filePath, "utf-8");
                    
                    docsData += `\n\n## File: ${filePath}\n\n`;
                    docsData += `This file contains JavaScript code. Here's an overview of its contents:\n\n`;

                    const parsed = esprima.parseModule(code, { comment: true, loc: true });

                    // Document imports
                    const imports = parsed.body.filter(node => node.type === 'ImportDeclaration');
                    if (imports.length > 0) {
                        docsData += "### Imports\n\n";
                        docsData += "This file imports the following modules or components:\n\n";
                        imports.forEach(imp => {
                            const importSource = imp.source.value;
                            const importSpecifiers = imp.specifiers.map(spec => spec.local.name).join(', ');
                            docsData += `- ${importSpecifiers} from '${importSource}'\n`;
                        });
                        docsData += "\n";
                    }

                    // Document functions
                    const functions = parsed.body.filter(node => 
                        node.type === 'FunctionDeclaration' || 
                        (node.type === 'VariableDeclaration' && 
                         node.declarations[0].init && 
                         (node.declarations[0].init.type === 'FunctionExpression' || 
                          node.declarations[0].init.type === 'ArrowFunctionExpression'))
                    );

                    if (functions.length > 0) {
                        docsData += "### Functions\n\n";
                        docsData += "This file defines the following functions:\n\n";
                        functions.forEach(func => {
                            let funcName = func.id ? func.id.name : func.declarations[0].id.name;
                            let params = func.params ? func.params.map(p => p.name).join(', ') : 
                                         func.declarations[0].init.params.map(p => p.name).join(', ');
                            docsData += `#### ${funcName}(${params})\n\n`;
                            docsData += `This function ${funcName} takes ${params ? `parameters: ${params}` : 'no parameters'}. `;
                            docsData += `It ${func.async ? 'is asynchronous and ' : ''}performs some operations related to its name.\n\n`;
                        });
                    }

                    // Document comments
                    const comments = parsed.comments.filter(comment => comment.type === 'Block');
                    if (comments.length > 0) {
                        docsData += "### Key Comments\n\n";
                        docsData += "The file contains these important comments:\n\n";
                        comments.forEach((comment) => {
                            docsData += `- At line ${comment.loc.start.line}: ${comment.value.trim()}\n\n`;
                        });
                    }

                } catch (error) {
                    console.warn(`Warning: Could not parse file ${filePath}. Error: ${error.message}`);
                }
            }
        });
    }

    scanDirectory(sourcePath);

    return docsData;
}

export default scanCode;