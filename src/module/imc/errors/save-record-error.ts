export class SaveRecordError extends Error {
  constructor(originalMessage: string) {
    super(`Error saving IMC record: ${originalMessage}`);
    this.name = 'SaveRecordError';
  }
}
