import { Command, APIinteraction, Event } from "./types";

export function isCommand(command: any): command is Command {
  return command;
}

export function isEvent(event: any): event is Event {
  return event;
}

export function isInteraction(interaction: any): interaction is APIinteraction {
  return interaction;
}
