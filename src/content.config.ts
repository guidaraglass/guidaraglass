import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const linkHashtags = (caption: string) => {
    return caption.replace(/#[a-zA-Z0-9]*/g, (match) => `<a href="https://www.instagram.com/explore/tags/${match.substring(1)}" target="_blank" rel="noopener noreferrer" class="App-link"><strong>${match}</strong></a>`);
};

const linkAccountNames = (caption: string) => {
    return caption.replace(/@[a-zA-Z0-9.]*/g, (match) => `<a href="https://www.instagram.com/${match.substring(1)}" target="_blank" rel="noopener noreferrer" class="App-link"><strong>${match}</strong></a>`);
};

const linkLinks = (caption: string) => {
    return caption.replace(/(https?:\/\/[^\s]+)/g, (match) => `<a href="${match}" target="_blank" rel="noopener noreferrer" class="App-link">${match}</a>`);
};

const createCaptions = (caption: string) => {
    const linkedLinks = linkLinks(caption);
    const linkedHashtags = linkHashtags(linkedLinks);
    const linkedAccountNames = linkAccountNames(linkedHashtags);
    
    return linkedAccountNames;
}

export const collections = {
	work: defineCollection({
		// Load Instagram posts from the content/work folder
		loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
		schema: z.object({
			id: z.string(),
			caption: z.string().optional(),
			image: z.string(),
			alt: z.string(),
			permalink: z.string().optional(),
		}),
	}),
};
