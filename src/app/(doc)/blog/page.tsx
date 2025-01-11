import { ghostApi } from "@/app/(doc)/blog/constants";
import { getExcerpt } from "@/app/(doc)/blog/helpers";
import { PostsOrPages } from "@tryghost/content-api";
import { format } from "date-fns";
import { ImageIcon, PenToolIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {};

export async function generateMetadata({}: Props): Promise<Metadata> {
  return {
    title: `Blog | Augend`,
    description: `Check out the latest blog posts on Augend.`,
  };
}

export default async function Page({}: Props) {
  if (!ghostApi) {
    return notFound();
  }
  const posts = await ghostApi.posts.browse({
    limit: 100,
    include: ["authors"],
  });
  return (
    <div className="w-full flex flex-col items-center flex-1">
      <div className="w-full flex flex-col justify-center max-w-7xl px-1 md:px-5 md:pt-4">
        <h1 className="font-bold text-4xl text-center text-balance px-7">
          Blog
        </h1>
        <div className="w-full flex flex-wrap mt-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="w-full md:w-1/2 lg:w-1/3 p-1 self-stretch flex"
              >
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="w-full flex flex-col items-center text-muted-foreground">
              <PenToolIcon className="size-10" />
              <p className="w-full text-center px-5 text-balance mt-2">
                No blog posts yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PostsOrPages[number] }) {
  const excerpt = getExcerpt(post.excerpt);
  const authors = post.authors;

  return (
    <Link
      href={`/blog/${post.slug}`}
      prefetch={false}
      className="w-full self-stretch flex flex-col border rounded-xl not-touch:hover:bg-background-hover active:bg-background-hover 
      focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden"
    >
      <div className="aspect-[120/63] flex items-center justify-center bg-border border-b overflow-hidden">
        {post.feature_image && (
          <img
            className="object-cover"
            width={1200}
            height={630}
            src={post.feature_image}
          />
        )}
        {!post.feature_image && (
          <ImageIcon className="size-10 text-muted-foreground" />
        )}
      </div>
      <div className="px-4 md:px-5 pt-3 pb-4 md:pt-3.5 md:pb-4.5 flex flex-col">
        <h2 className="w-full text-lg font-bold leading-snug text-balance">
          {post.title}
        </h2>
        {excerpt && <p className="text-muted-foreground mt-1">{excerpt}</p>}
        {post.published_at && (
          <div className="w-full flex mt-3 items-center">
            <p className="text-muted-foreground bg-foreground/8 px-1.75 py-0.5 text-sm rounded-sm font-medium">
              {post.published_at && (
                <span>
                  {format(new Date(post.published_at), "MMMM dd, yyyy")}
                </span>
              )}
              {post.published_at && post.reading_time && (
                <span className="text-muted-more-foreground">{" • "}</span>
              )}
              {post.reading_time && <span>{post.reading_time} min read</span>}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
