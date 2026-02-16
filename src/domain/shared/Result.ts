export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _error: string | undefined;
  private readonly _value: T | undefined;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of a failed result. Use errorValue instead.');
    }
    return this._value as T;
  }

  get errorValue(): string {
    if (!this.isFailure) {
      throw new Error('Cannot get the error of a successful result.');
    }
    return this._error as string;
  }

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  static combine(results: Result<unknown>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.errorValue);
      }
    }
    return Result.ok();
  }
}
