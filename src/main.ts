import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  core.debug("start of action");

  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    const {payload} = github.context;

    if (Array.isArray(payload.pages)) {
      core.debug(
        `page compare url: ${payload.pages[0].html_url}/_compare/${payload.pages[0].sha}`,
      );
      const pagesUpdated = payload.pages.map(page => {
        const diffUrl = `${page.html_url}/_compare/${page.sha}`;

        return `[${page.title}](${page.html_url}) was updated by [${
          payload.sender?.login
        }](${payload.sender?.html_url})! Look at the diff [here](${diffUrl})\n
        ${page.summary ?? ""}`;
      });

      axios.post(hookUrl, {
        text: `:tada: The Wiki was updated :tada: \n
        ${pagesUpdated.join("\n*")}`,
      });
    }
  } catch (error) {
    core.error(JSON.stringify(error, null, 2));
    core.setFailed((error as Error).message);
  }
}

run();
