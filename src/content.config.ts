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
			let response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink&access_token=${import.meta.env.VITE_ACCESS_TOKEN}`);
			const data = await response.json();
			console.log({data})
			let isMoreData = data.paging.next !== undefined;
			while (isMoreData) {
				response = await fetch(data.paging.next);
				console.log({response})
				const nextData = await response.json();
				data.data.push(...nextData.data);
				isMoreData = nextData.paging.next
			}
			// Must return an array of entries with an id property, or an object with IDs as keys and entries as values
			return data.data.filter((post: { id: string; media_type: string; media_url: string | null }) => post.media_type !== 'VIDEO' && post.media_url !== undefined ).map((post: { caption: string }) => {
				console.log({post})
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
