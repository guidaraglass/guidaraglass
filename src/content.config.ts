import { defineCollection, z } from 'astro:content';

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
		// Load Instagram posts from the REST API
		loader: async () => {
			const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink&access_token=${import.meta.env.VITE_ACCESS_TOKEN}`);
			const data = await response.json();
			// Must return an array of entries with an id property, or an object with IDs as keys and entries as values
			return data.data.filter((post: { media_type: string; }) => post.media_type !== 'VIDEO' && post.media_type !== 'CAROUSEL_ALBUM').map((post: { caption: string }) => {
				return { 
					...post,
					caption: createCaptions(post.caption)
				};
			});
		},
		schema: z.object({
			id: z.string(),
			caption: z.string(),
			media_type: z.string(),
			media_url: z.string(),
			permalink: z.string(),
		}),
	}),
};
