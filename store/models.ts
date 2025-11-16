// Type definitions for all models used in the application

export type Todo = {
	id: string;
	text: string;
	done: boolean;
	priority: 'low' | 'medium' | 'high';
	dueDate: string;
	createdAt: string;
	updatedAt: string;
};

export type Note = {
	id: string;
	title: string;
	content: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
};

export type ShoppingList = {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
};

export type ShoppingItem = {
	id: string;
	listId: string;
	name: string;
	quantity: number;
	price: number;
	checked: boolean;
	createdAt: number;
	updatedAt: number;
};

export type Category = {
	id: string;
	name: string;
	color: string;
	icon?: string;
};

