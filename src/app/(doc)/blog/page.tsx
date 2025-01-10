import { ghostApi } from "@/app/(doc)/blog/constants";
import { getExcerpt } from "@/app/(doc)/blog/helpers";
import { PostsOrPages } from "@tryghost/content-api";
import { ImageIcon } from "lucide-react";
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
  });
  return (
    <div className="w-full flex flex-col items-center flex-1">
      <div className="w-full flex flex-col justify-center max-w-7xl px-1 md:px-5">
        <h1 className="font-bold text-4xl text-center text-balance">Blog</h1>
        <div className="w-full flex flex-wrap mt-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="w-full md:w-1/2 lg:w-1/3 p-1 self-stretch flex"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PostsOrPages[number] }) {
  const excerpt = getExcerpt(post.excerpt);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="w-full self-stretch flex flex-col border rounded-xl p-2 not-touch:hover:bg-border active:bg-border 
      focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="aspect-[16/9] flex items-center justify-center bg-border rounded-md overflow-hidden">
        {post.feature_image && (
          <img
            className="object-cover"
            width={1920}
            height={1080}
            src={post.feature_image}
          />
        )}
        {!post.feature_image && (
          <ImageIcon className="size-10 text-muted-foreground" />
        )}
      </div>
      <div className="px-2 pt-3 pb-1 flex flex-col">
        <h2 className="text-lg font-bold leading-snug">{post.title}</h2>
        {excerpt && <p className="text-muted-foreground mt-1">{excerpt}</p>}
      </div>
    </Link>
  );
}
