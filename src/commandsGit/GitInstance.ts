import * as vscode from 'vscode';
import * as gitCommands from '../commandsGit/gitCommands';
import * as branchHandler from '../commandsGit/branchHandler';
import * as historyHandler from '../commandsGit/historyHandler';
import * as stashHandler from '../commandsGit/stashHandler';
import { Dirent, Dirent as fsDirent } from 'fs';
import { runGitCommand } from './gitExecutor';

class GitInstance {
  private static instance: GitInstance;
  private _onDidChangeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeData: vscode.Event<void> = this._onDidChangeData.event;
  private repoPath: string;
  private userInfo: { name: string, email: string } | null = null;
  private status: string | null = null;
  private branches: Array<{ name: string, current: boolean }> = [];
  private commitHistory: Array<{ hash: string, author: string, date: string, message: string }> = [];
  private stashList: Array<{ index: string, message: string }> = [];
  private isRepoInitialized: boolean;

  private constructor(repoPath: string) {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      const possibleRepoPath = path.join(repoPath, path.basename(repoPath));
      if (fs.existsSync(path.join(possibleRepoPath, '.git'))) {
          repoPath = possibleRepoPath;
      }
  }

  this.repoPath = repoPath;
  this.isRepoInitialized = false;
  }

  public static async createInstance(repoPath: string): Promise<GitInstance> {
    repoPath = this.findGitRepoPath(repoPath);

    const instance = new GitInstance(repoPath);
    instance.isRepoInitialized = await instance.checkIfRepoExists();
    return instance;
  }

  private async checkIfRepoExists(): Promise<boolean> {
    return await gitCommands.isGitRepository(this.repoPath);
  }

  public async initializeRepo(): Promise<void> {
    if (!this.isRepoInitialized) {
      try {
        await gitCommands.initRepo(this.repoPath);
        this.isRepoInitialized = true;
        vscode.window.showInformationMessage('Dépôt Git initialisé avec succès.');
      } catch (error) {
        vscode.window.showErrorMessage('Erreur lors de l\'initialisation du dépôt : ' + error);
      }
    } else {
      vscode.window.showInformationMessage('Un dépôt Git existe déjà.');
    }
  }

  public async cloneRepository(url: string): Promise<void> {
    if (!this.isRepoInitialized) {
      try {
        await gitCommands.cloneRepo(this.repoPath, url);
        this.isRepoInitialized = true;
        vscode.window.showInformationMessage('Dépôt cloné avec succès.');
      } catch (error) {
        vscode.window.showErrorMessage('Erreur lors du clonage du dépôt : ' + error);
      }
    } else {
      vscode.window.showInformationMessage('Un dépôt Git est déjà présent.');
    }
  }

  public static async getInstance(repoPath: string): Promise<GitInstance | null> {
    const correctedPath = GitInstance.findGitRepoPath(repoPath);

    if (!await gitCommands.isGitRepository(correctedPath)) {
        return null;
    }

    if (!GitInstance.instance) {
        GitInstance.instance = new GitInstance(correctedPath);
        await GitInstance.instance.updateAll();
    }
    return GitInstance.instance;
  }

  public async updateAll(): Promise<void> {
    try {
      this.isRepoInitialized = await this.checkIfRepoExists();
      if (!this.isRepoInitialized) {
        return;
      }

      await this.updateUserInfo();
      await this.updateRepoStatus();
      await this.updateBranches();
      await this.updateCommitHistory();
      await this.updateStash();
      this._onDidChangeData.fire();
    } catch (error) {
      console.error("Erreur lors de la mise à jour complète :", error);
    }
  }

  public async updateUserInfo(): Promise<void> {
    try {
      this.userInfo = {
        name: await gitCommands.getGitUserName(),
        email: await gitCommands.getGitUserEmail()
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des infos utilisateur :", error);
    }
  }

  public async updateRepoStatus(): Promise<void> {
    try {
      this.status = await gitCommands.getGitStatus(this.repoPath);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du repo :", error);
    }
  }

  public async updateBranches(): Promise<void> { 
    try {
      this.branches = await branchHandler.listBranches(this.repoPath);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des branches :", error);
    }
  }

  public async updateCommitHistory(): Promise<void> {
    try {
      this.commitHistory = await historyHandler.getGitLog(this.repoPath);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'historique des commits :", error);
    }
  }

  public async updateStash(): Promise<void> {
    try {
      this.stashList = await stashHandler.listStash(this.repoPath);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stash :", error);
    }
  }

  public static findGitRepoPath(basePath: string): string {
    const fs = require('fs');
    const path = require('path');

    if (fs.existsSync(path.join(basePath, '.git'))) {
        return basePath;
    }

    const queue = [basePath];
    while (queue.length > 0) {
        const currentPath = queue.shift();
        if (!currentPath) continue;

                            const subfolders = fs.readdirSync(currentPath, { withFileTypes: true })
                                                .filter((dirent: Dirent) => dirent.isDirectory())
                                                .map((dirent: Dirent) => path.join(currentPath, dirent.name));

        for (const folder of subfolders) {
            if (fs.existsSync(path.join(folder, '.git'))) {
                return folder;
            }
            queue.push(folder);
        }
    }
    return basePath;
  }

  public async getBranchCommits(branchName: string): Promise<Array<{ hash: string, author: string, date: string, message: string }>> {
    try {
      return await historyHandler.getBranchCommits(this.repoPath, branchName);
    } catch (error) {
      console.error(`⚠ Erreur lors de la récupération des commits pour la branche ${branchName}:`, error);
      return [];
    }
  }

  public async getAllBranches(): Promise<Array<{ name: string, isRemote: boolean }>> {
    try {
      const localBranches = await runGitCommand(`branch --format="%(refname:short)"`, this.repoPath);
      const remoteBranches = await runGitCommand(`branch -r --format="%(refname:short)"`, this.repoPath);
  
      return [
        ...localBranches.split("\n").map(branch => ({ name: branch.trim(), isRemote: false })),
        ...remoteBranches.split("\n").map(branch => ({ name: branch.trim(), isRemote: true })),
      ];
    } catch (error) {
      console.error("Erreur lors de la récupération des branches :", error);
      return [];
    }
  }
  
  public async getCurrentBranch(): Promise<string> {
    try {
      return await runGitCommand(`rev-parse --abbrev-ref HEAD`, this.repoPath);
    } catch (error) {
      console.error("Erreur lors de la récupération du HEAD :", error);
      return "unknown";
    }
  }
  
  public getUserInfo() { return this.userInfo; }
  public getRepoStatus() { return this.status; }
  public getBranches() { return this.branches; }
  public getCommitHistory() { return this.commitHistory; }
  public getStashList() { return this.stashList; }
  public getIsRepoInitialized() { return this.isRepoInitialized; }
  public getRepoPath() { return this.repoPath; }
}

export default GitInstance;
