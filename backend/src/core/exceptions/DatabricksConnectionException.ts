export class DatabricksConnectionException extends Error {
  constructor(
    message: string = 'Failed to connect to Databricks SQL Warehouse',
    public readonly error?: Error | undefined,
  ) {
    super(message);
    this.name = 'DatabricksConnectionException';
  }
}