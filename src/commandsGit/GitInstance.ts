import * as vscode from 'vscode';
import * as gitCommands from '../commandsGit/gitCommands';
import * as branchHandler from '../commandsGit/branchHandler';
import * as historyHandler from '../commandsGit/historyHandler';
import * as stashHandler from '../commandsGit/stashHandler';

class GitInstance {
  private static instance: GitInstance;
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
          console.log("🔄 Correction du chemin du dépôt :", possibleRepoPath);
          repoPath = possibleRepoPath;
      }
  }

  this.repoPath = repoPath;
  this.isRepoInitialized = false;
  }

  public static async createInstance(repoPath: string): Promise<GitInstance> {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(path.join(repoPath, '.git'))) {
        const possibleRepoPath = path.join(repoPath, path.basename(repoPath));
        if (fs.existsSync(path.join(possibleRepoPath, '.git'))) {
            console.log("🔄 Correction du chemin du dépôt dans createInstance :", possibleRepoPath);
            repoPath = possibleRepoPath;
        }
    }

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

  public static async getInstance(repoPath: string): Promise<GitInstance> {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(path.join(repoPath, '.git'))) {
        const possibleRepoPath = path.join(repoPath, path.basename(repoPath));
        if (fs.existsSync(path.join(possibleRepoPath, '.git'))) {
            console.log("🔄 Correction du chemin du dépôt dans getInstance :", possibleRepoPath);
            repoPath = possibleRepoPath;
        }
    }

    const instance = new GitInstance(repoPath);
    instance.isRepoInitialized = await instance.checkIfRepoExists();
    return instance;
}

  public async updateAll(): Promise<void> {
    try {
      this.isRepoInitialized = await this.checkIfRepoExists();

      await this.updateUserInfo();
      await this.updateRepoStatus();
      await this.updateBranches();
      await this.updateCommitHistory();
      await this.updateStash();
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

  public getUserInfo() { return this.userInfo; }
  public getRepoStatus() { return this.status; }
  public getBranches() { return this.branches; }
  public getCommitHistory() { return this.commitHistory; }
  public getStashList() { return this.stashList; }
  public getIsRepoInitialized() { return this.isRepoInitialized; }
  public getRepoPath() { return this.repoPath; }
}

export default GitInstance;
