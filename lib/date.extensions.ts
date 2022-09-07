export {}

declare global {
  interface Date {
    toSerializable(): string;
  }
}

Date.prototype.toSerializable = function() {
  return JSON.parse(JSON.stringify(this));
}

export const serializeDate = (date: Date): string => {
  return date != null ? date.toSerializable() : null;
}