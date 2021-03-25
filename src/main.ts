import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    const {payload} = github.context;
    if (Array.isArray(payload.pages)) {
      const pagesUpdated = payload.pages.map(page => {
        return `[${page.title}](${page.html_url}) was updated by [${
          payload.sender?.login
        }](${payload.sender?.html_url})! ${page.summary ?? ""}`;
      });

      axios.post(hookUrl, {
        text: `:tada: The Wiki was updated :tada: \n* ${pagesUpdated.join(
          "\n* ",
        )}`,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
