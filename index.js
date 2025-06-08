#!/usr/bin/env node

import { Command } from "commander";
import { initializeProject } from "./src/commands/init.js";
import { watchPages } from "./src/commands/watch.js";

const program = new Command();

program
  .name("fbr")
  .description("File-based routing CLI for React projects")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize file-based routing in a React project")
  .action(initializeProject);

program
  .command("watch")
  .description("Watch pages directory for changes and update routes")
  .action(watchPages);

program.parse();
