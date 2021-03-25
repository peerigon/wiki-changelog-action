import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<void> {
  try {
    const hookUrl = core.getInput('mattermost-hook-url')
    core.debug(`HookUrl: ${hookUrl}`)

    axios.post(hookUrl, {text: 'test from action'})
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
