"use client";

import { ClientOnly, BlogSkeleton } from './ui/loading';
import BlogView from './blog-view';

export default function BlogViewWrapped() {
  return (
    <ClientOnly fallback={<BlogSkeleton />}>
      <BlogView />
    </ClientOnly>
  );
}