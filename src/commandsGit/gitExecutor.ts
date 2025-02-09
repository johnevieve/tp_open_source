import { exec } from 'child_process';

export function runGitCommand(command: string, repoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log(`🔧 Exécution de : git ${command} dans ${repoPath}`);

        exec(`git ${command}`, { cwd: repoPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Erreur : ${stderr.trim()}`);
                reject(new Error(`Git Error: ${stderr.trim()}`));
            } else {
                console.log(`✅ Résultat : ${stdout.trim()}`);
                resolve(stdout.trim());
            }
        });
    });
}
