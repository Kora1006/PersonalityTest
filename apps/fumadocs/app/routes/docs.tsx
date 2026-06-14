import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
	MarkdownCopyButton,
	ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";

import { useMDXComponents } from "@/components/mdx";
import { baseOptions } from "@/lib/layout.shared";
import { getPageImagePath } from "@/lib/og";
import { gitConfig } from "@/lib/shared";
import { getPageMarkdownUrl, source } from "@/lib/source";

import type { Route } from "./+types/docs";

export async function loader({ params }: Route.LoaderArgs) {
	const slugs = params["*"].split("/").filter((v) => v.length > 0);
	const page = source.getPage(slugs);
	if (!page) {
		throw new Response("Not found", { status: 404 });
	}

	return {
		path: page.path,
		markdownUrl: getPageMarkdownUrl(page).url,
		pageTree: await source.serializePageTree(source.getPageTree()),
		imagePath: getPageImagePath(slugs),
	};
}

const clientLoader = browserCollections.docs.createClientLoader({
	component(
		{ toc, frontmatter, default: Mdx },
		// you can define props for the `<Content />` component
		{
			markdownUrl,
			path,
			imagePath,
		}: {
			markdownUrl: string;
			path: string;
			imagePath: string;
		}
	) {
		return (
			<DocsPage toc={toc}>
				<title>{frontmatter.title}</title>
				<meta content={frontmatter.description} name="description" />
				<meta content={imagePath} property="og:image" />
				<DocsTitle>{frontmatter.title}</DocsTitle>
				<DocsDescription>{frontmatter.description}</DocsDescription>
				<div className="-mt-4 flex flex-row items-center gap-2 border-b pb-6">
					<MarkdownCopyButton markdownUrl={markdownUrl} />
					<ViewOptionsPopover
						githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
						markdownUrl={markdownUrl}
					/>
				</div>
				<DocsBody>
					<Mdx components={useMDXComponents()} />
				</DocsBody>
			</DocsPage>
		);
	},
});

export default function Page({ loaderData }: Route.ComponentProps) {
	const { path, pageTree, imagePath, markdownUrl } =
		useFumadocsLoader(loaderData);

	return (
		<DocsLayout {...baseOptions()} tree={pageTree}>
			{clientLoader.useContent(path, { markdownUrl, path, imagePath })}
		</DocsLayout>
	);
}
