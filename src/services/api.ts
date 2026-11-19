import categoriesData from '../data/categories.json';
import postsData from '../data/posts.json';
import commentsData from '../data/comments.json';
import { Category, Post, WPComment, filterAndSortPosts } from '../utils/blogLogic';

export type { Category, Post, WPComment };

export function getAllCategories(): Category[] {
  return categoriesData as Category[];
}

export function getAllPosts(): Post[] {
  return (postsData as Post[]).slice().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function fetchCategories(): Promise<Category[]> {
  return getAllCategories();
}

export async function fetchPosts(
  categoryIds?: number[],
  searchQuery?: string
): Promise<Post[]> {
  const all = getAllPosts();
  return filterAndSortPosts(all, {
    categoryIds,
    searchQuery,
    sortBy: 'recent',
  });
}

export async function fetchPost(id: number): Promise<Post> {
  const post = getAllPosts().find((p) => p.id === id);
  if (!post) throw new Error('Artigo não encontrado');
  return post;
}

export async function fetchComments(postId: number): Promise<WPComment[]> {
  return (commentsData as WPComment[]).filter((c) => c.post === postId);
}
