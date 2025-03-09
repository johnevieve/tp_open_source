import { runGitCommand } from './gitExecutor';

/**
 * Récupère le nom de l'utilisateur Git actuel
 */
export async function getGitUserName(): Promise<string> {
    return runGitCommand('config --global user.name', process.cwd());
}

/**
 * Récupère le nom de l'utilisateur Git actuel
 */
export async function getGitUserEmail(): Promise<string> {
    return runGitCommand('config --global user.email', process.cwd());
}

/**
 * Configure le nom global de l'utilisateur Git
 */
export async function setGitUserName(name: string): Promise<string> {
    return runGitCommand(`config --global user.name "${name}"`, process.cwd());
}

/**
 * Configure l'email global de l'utilisateur Git
 */
export async function setGitUserEmail(email: string): Promise<string> {
    return runGitCommand(`config --global user.email "${email}"`, process.cwd());
}

/**
 * Initialise un nouveau dépôt Git
 */
export async function initRepo(repoPath: string): Promise<string> {
    return runGitCommand('init', repoPath);
}

/**
 * Clone un dépôt Git
 */
export async function cloneRepo(repoPath: string, url: string): Promise<string> {
    return runGitCommand(`clone ${url}`, repoPath);
}

/**
 * Vérifie le statut Git du dépôt
 */
export async function getGitStatus(repoPath: string): Promise<string> {
    return runGitCommand('status --short', repoPath);
}

/**
 * Ajoute un fichier ou tous les fichiers à l'index Git
 */
export async function gitAdd(repoPath: string, filePath: string = '.'): Promise<string> {
    return runGitCommand(`add ${filePath}`, repoPath);
}

/**
 * Effectue un commit avec un message
 */
export async function gitCommit(repoPath: string, message: string): Promise<string> {
    return runGitCommand(`commit -m "${message}"`, repoPath);
}

/**
 * Annule le suivi d'un fichier dans l'index (sans le supprimer du disque)
 */
export async function gitResetFile(repoPath: string, filePath: string): Promise<string> {
    return runGitCommand(`reset ${filePath}`, repoPath);
}

/**
 * Vérifie si un dossier est un dépôt Git valide
 */
export async function isGitRepository(repoPath: string): Promise<boolean> {
    try {
        await runGitCommand('rev-parse --is-inside-work-tree', repoPath);
        return true;
    } catch (error) {
        return false;
    }
}