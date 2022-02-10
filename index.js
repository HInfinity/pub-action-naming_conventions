import { info, setFailed, getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import configuration from "./config/config.json";

const validEvent = ["push", "pull_request"];

function getBranchName(eventName, payload) {
    let branchName;
    switch (eventName) {
        case "push":
            branchName = payload.ref.replace("refs/heads/", "");
            break;
        case "pull_request":
            branchName = payload.pull_request.head.ref;
            break;
        default:
            throw new Error(`Invalid event name: ${eventName}`);
    }
    return branchName;
}

function validateBranchName(branch) {
    // Check if branch is to be ignored
    const ignore = configuration.branch.ignore;
    if (ignore.length > 0 && ignore.split(",").some((el) => branch === el)) {
        info(`Skipping checks since ${branch} is in the ignored list - ${ignore}`);
        return true;
    }

    // Check if branch pass regex
    const regex = configuration.branch.regex;
    const found = branch.match(regex);
    info(`Regex: ${regex}`);
    if (found === null || found[0] !== branch) {
        setFailed(`Branch ${branch} failed to pass match regex - ${regex}`);
        return false;
    }

    // Check if branch starts with a prefix
    const prefixes = configuration.branch.allowed_prefixes;
    info(`Allowed Prefixes: ${prefixes}`);
    if (prefixes.length > 0 && !prefixes.split(",").some((el) => branch.startsWith(el))) {
        setFailed(`Branch ${branch} failed did not match any of the prefixes - ${prefixes}`);
        return false;
    }

    // Check min length
    const minLen = configuration.branch.min_length;
    if (branch.length < minLen) {
        setFailed(`Branch ${branch} is smaller than min length specified - ${minLen}`);
        return false;
    }

    // Check max length
    const maxLen = configuration.branch.max_length;
    if (maxLen > 0 && branch.length > maxLen) {
        setFailed(`Branch ${branch} is greater than max length specified - ${maxLen}`);
        return false;
    }
    return true;
}

function validateRepositoryName(repo) {
    // Check if repo pass regex
    const regex = configuration.repo.regex;
    const found = repo.match(regex);
    info(`Regex: ${regex}`);
    if (found === null || found[0] !== repo) {
        setFailed(`Repo ${repo} failed to pass match regex - ${regex}`);
        return false;
    }

    // Check min length
    const minLen = configuration.repo.min_length;
    if (repo.length < minLen) {
        setFailed(`Repo ${repo} is smaller than min length specified - ${minLen}`);
        return false;
    }

    // Check max length
    const maxLen = configuration.repo.max_length;
    if (maxLen > 0 && repo.length > maxLen) {
        setFailed(`Repo ${repo} is greater than max length specified - ${maxLen}`);
        return false;
    }
    return true;
}

async function run() {
    /*  const GITHUB_TOKEN = getInput("GITHUB_TOKEN");
  const octokit = getOctokit(GITHUB_TOKEN);

  const { pull_request } = context.payload;

  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_request.number,
    body: "Thank you for submitting a pull request! We will try to review this as soon as we can.",
  });*/

    try {
        const eventName = context.eventName;
        info(`Event name: ${eventName}`);
        if (validEvent.indexOf(eventName) < 0) {
            setFailed(`Invalid event: ${eventName}`);
            return;
        }

        const repo = context.repo.repo;
        info(`Repository name: ${repo}`);
        if (!validateRepositoryName(repo)) {
            return;
        }

        const branch = getBranchName(eventName, context.payload);
        info(`Branch name: ${branch}`);
        if (!validateBranchName(branch)) {
            return;
        }
    } catch (error) {
        setFailed(error.message);
    }

    /*  try {
      const eventName = context.eventName;
      info(`Event name: ${eventName}`);
      if (validEvent.indexOf(eventName) < 0) {
        setFailed(`Invalid event: ${eventName}`);
        return;
      }
  
      const branch = getBranchName(eventName, context.payload);
      info(`Branch name: ${branch}`);
      // Check if branch is to be ignored
      const ignore = getInput("ignore");
      if (ignore.length > 0 && ignore.split(",").some((el) => branch === el)) {
        info(
          `Skipping checks since ${branch} is in the ignored list - ${ignore}`
        );
        return;
      }
  
      // Check if branch pass regex
      const regex = getInput("regex");
      const found = branch.match(regex);
      info(`Regex: ${regex}`);
      if (found === null || found[0] !== branch) {
        setFailed(`Branch ${branch} failed to pass match regex - ${regex}`);
        return;
      }
  
      // Check if branch starts with a prefix
      const prefixes = getInput("allowed_prefixes");
      info(`Allowed Prefixes: ${prefixes}`);
      if (
        prefixes.length > 0 &&
        !prefixes.split(",").some((el) => branch.startsWith(el))
      ) {
        setFailed(
          `Branch ${branch} failed did not match any of the prefixes - ${prefixes}`
        );
        return;
      }
  
      // Check min length
      const minLen = parseInt(getInput("min_length"));
      if (branch.length < minLen) {
        setFailed(
          `Branch ${branch} is smaller than min length specified - ${minLen}`
        );
        return;
      }
  
      // Check max length
      const maxLen = parseInt(getInput("max_length"));
      if (maxLen > 0 && branch.length > maxLen) {
        setFailed(
          `Branch ${branch} is greater than max length specified - ${maxLen}`
        );
        return;
      }
    } catch (error) {
      setFailed(error.message);
    }*/
}

run();
