# Admin Post Slug Spec

## Goal

Post detail URLs should use `posts.slug` instead of numeric `posts.id`.

Current public URL shape:

```txt
/posts/{category}/{slug}
```

Example:

```txt
/posts/computer%20science/react-props
```

The numeric `id` remains the internal primary key for comments, bookmarks, likes, and view counts.

## Required Database Change

Run this SQL in Supabase SQL Editor before deploying the app changes:

```txt
supabase/post_slug_migration.sql
```

It adds:

- `public.posts.slug text not null`
- unique index on `posts.slug`
- `public.slugify_post_title(value text)`
- `public.is_post_slug_available(candidate_slug text, current_post_id integer default null)`
- trigger that auto-fills `slug` when it is empty

## Admin UI Fields

Add a `slug` field to the post create/edit form.

Recommended behavior:

- Label: `Slug`
- Placeholder: `auto-generated-from-title`
- Optional on create. If empty, Supabase trigger generates it from `title`.
- Editable on update, but show a warning that changing it changes the public URL.
- Show URL preview:

```txt
/posts/{categorySlug}/{slugPreview}
```

## Create Flow

When creating a post:

```ts
const { data, error } = await supabase
  .from("posts")
  .insert({
    title,
    contents,
    author_id,
    author_name,
    visibility,
    category_id,
    slug: slugInput || null,
  })
  .select("id, slug")
  .single();
```

If `slug` is `null` or empty, DB trigger creates one from `title`.

## Edit Flow

When editing a post:

```ts
const { data, error } = await supabase
  .from("posts")
  .update({
    title,
    contents,
    visibility,
    category_id,
    slug: slugInput,
    updated_at: new Date().toISOString(),
  })
  .eq("id", postId)
  .select("id, slug")
  .single();
```

Keep the existing slug by default. Only send a changed slug when the admin intentionally edits it.

## Slug Preview

Use the DB helper so the preview matches production behavior:

```ts
const { data: normalizedSlug } = await supabase.rpc("slugify_post_title", {
  value: slugInput || title,
});
```

Fallback client-side normalization may be used only for instant UI preview, but DB output is authoritative.

## Duplicate Check

Before save, check uniqueness:

```ts
const { data: isAvailable } = await supabase.rpc("is_post_slug_available", {
  candidate_slug: slugInput || title,
  current_post_id: postId ?? null,
});
```

If `isAvailable` is false, block submit and ask the admin to change the slug.

## Validation

Recommended form validation:

- Trim whitespace.
- Allow empty slug on create.
- After normalization, slug must not be empty.
- Use the duplicate check before submit.
- Do not use numeric `id` in generated public links.

## Backward Compatibility

Existing numeric URLs like `/posts/computer%20science/122` will no longer resolve after this change unless a redirect layer is added.

Optional redirect behavior:

- If route param is numeric, fetch by `id`.
- Redirect to `/posts/{categorySlug}/{post.slug}`.

This is optional, but useful if old links are already shared publicly.
