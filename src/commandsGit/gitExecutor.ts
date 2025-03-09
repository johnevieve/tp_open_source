import { exec } from 'child_process';

export function runGitCommand(command: string, repoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(`git ${command}`, { cwd: repoPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Erreur complète :`, error);
                reject(new Error(`Git Error: ${stderr.trim() || error.message}`));
            } else {
                resolve(stdout.trim());
            }
        });
    });
}
