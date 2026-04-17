import announceCommand from './announce';
import concernCommand from './concern';
import helpCommand from './help';
import rulesCommand from './rules';
import tagCommand from './tag';
import verifyCommand from './verify';
import type { Command } from '../types';

const commands: Command[] = [
  announceCommand,
  concernCommand,
  helpCommand,
  rulesCommand,
  tagCommand,
  verifyCommand,
];

export default commands;
