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

  private constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  public static getInstance(repoPath: string): GitInstance {
    if (!GitInstance.instance) {
        GitInstance.instance = new GitInstance(repoPath);
    }
    return GitInstance.instance;
  }

  public async update(): Promise<void> {
    try {
        this.userInfo = {
            name: await gitCommands.getGitUserName(),
            email: await gitCommands.getGitUserEmail()
        };
        this.status = await gitCommands.getGitStatus(this.repoPath);
        this.branches = await branchHandler.listBranches(this.repoPath);
        this.commitHistory = await historyHandler.getGitLog(this.repoPath);
        this.stashList = await stashHandler.listStash(this.repoPath);
    } catch (error) {
        console.error("Erreur lors de la mise à jour des données Git :", error);
    }
  }

  public getUserInfo() {
    return this.userInfo;
  }

  public getRepoStatus() {
    return this.status;
  }

  public getBranches() {
    return this.branches;
  }

  public getCommitHistory() {
    return this.commitHistory;
  }

  public getStashList() {
    return this.stashList;
  }
}

export default GitInstance;