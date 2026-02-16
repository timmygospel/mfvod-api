import { Result } from './Result.js';

export interface GuardArgument {
  argument: unknown;
  argumentName: string;
}

export class Guard {
  static againstNullOrUndefined(argument: unknown, argumentName: string): Result<void> {
    if (argument === null || argument === undefined) {
      return Result.fail(`${argumentName} is null or undefined`);
    }
    return Result.ok();
  }

  static againstNullOrUndefinedBulk(args: GuardArgument[]): Result<void> {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }

  static inRange(num: number, min: number, max: number, argumentName: string): Result<void> {
    if (num < min || num > max) {
      return Result.fail(`${argumentName} is not within range ${min} to ${max}.`);
    }
    return Result.ok();
  }

  static againstAtLeast(numChars: number, text: string, argumentName: string): Result<void> {
    if (text.length < numChars) {
      return Result.fail(`${argumentName} must be at least ${numChars} characters.`);
    }
    return Result.ok();
  }

  static againstAtMost(numChars: number, text: string, argumentName: string): Result<void> {
    if (text.length > numChars) {
      return Result.fail(`${argumentName} must be at most ${numChars} characters.`);
    }
    return Result.ok();
  }
}
