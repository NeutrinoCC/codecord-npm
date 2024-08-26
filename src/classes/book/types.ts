import {
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  MessageEditOptions,
  MessagePayload,
  ModalSubmitInteraction,
} from "discord.js";

// Type for a function that renders a message, returning either a payload or editing options
export type Render = () =>
  | Promise<MessagePayload | MessageEditOptions>
  | MessagePayload
  | MessageEditOptions;

// Type for a function that returns the length (number of pages, etc.)
export type Length = () => Promise<number> | number;

// Type for a function that returns the length of a specific page if applicable
export type PageLength = () => Promise<number> | number;

// Combined type for command interactions related to books
export type BookInteraction =
  | ChatInputCommandInteraction
  | MessageComponentInteraction;

// Interface for a book constructor that requires render and length methods
export interface BookConstructor {
  render: Render; // Method to render the content
  length: Length; // Method to get the length
  pageLength?: PageLength; // Optional method to get the length of pages
  interaction: BookInteraction; // Interaction used for the book
}
