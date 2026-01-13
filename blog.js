document.addEventListener('DOMContentLoaded', () => {
    const blogContent = document.getElementById('blog-content');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');

    if (postId) {
        loadPost(postId);
    } else {
        loadPostList();
    }

    async function loadPostList() {
        try {
            const response = await fetch('blog/posts.json');
            if (!response.ok) throw new Error('Failed to load posts');
            const posts = await response.json();

            if (posts.length === 0) {
                blogContent.innerHTML = '<p>No posts found.</p>';
                return;
            }

            let html = '<h2 class="section-title">Latest Posts</h2><div class="blog-list">';
            posts.forEach(post => {
                html += `
                    <div class="blog-preview">
                        <h3><a href="blog.html?post=${post.id}">${post.title}</a></h3>
                        <p class="date">${formatDate(post.date)}</p>
                        <p class="summary">${post.summary}</p>
                        <a href="blog.html?post=${post.id}" class="read-more">Read more &rarr;</a>
                    </div>
                `;
            });
            html += '</div>';
            blogContent.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
            blogContent.innerHTML = '<p>Error loading blog posts. Please try again later.</p>';
        }
    }

    async function loadPost(id) {
        try {
            // Fetch the post manifest to find the file path
            const listResponse = await fetch('blog/posts.json');
            if (!listResponse.ok) throw new Error('Failed to load posts list');
            const posts = await listResponse.json();
            const post = posts.find(p => p.id === id);

            if (!post) {
                blogContent.innerHTML = '<p>Post not found.</p><a href="blog.html">&larr; Back to Blog</a>';
                return;
            }

            // Determine filename: use 'file' property or default to id + .html
            const filename = post.file || `${id}.html`;
            const fileUrl = `blog/posts/${filename}`;

            const response = await fetch(fileUrl);
            if (!response.ok) {
                 if (response.status === 404) {
                     blogContent.innerHTML = '<p>Post content not found.</p><a href="blog.html">&larr; Back to Blog</a>';
                     return;
                 }
                 throw new Error('Failed to load post content');
            }

            let content = await response.text();

            // Check if Markdown
            if (filename.endsWith('.md')) {
                // Configure marked to handle relative image paths
                // We assume images are located in blog/posts/ relative to the site root
                const renderer = new marked.Renderer();
                const originalImage = renderer.image.bind(renderer);
                renderer.image = (href, title, text) => {
                    // If the link is relative (doesn't start with http, https, or /)
                    // prepend the blog posts directory
                    if (href && !href.match(/^(http|https|\/)/)) {
                        href = `blog/posts/${href}`;
                    }
                    return originalImage(href, title, text);
                };

                // Parse Markdown
                const htmlContent = marked.parse(content, { renderer: renderer });

                content = `
                    <article class="blog-post">
                        <h1>${post.title}</h1>
                        <p class="post-meta">Published on ${formatDate(post.date)}</p>
                        <div class="post-content">
                            ${htmlContent}
                        </div>
                    </article>
                `;
            }

            blogContent.innerHTML = `
                <div class="blog-post-container">
                    <a href="blog.html" class="back-link">&larr; Back to Blog</a>
                    ${content}
                </div>
            `;
        } catch (error) {
             console.error('Error:', error);
             blogContent.innerHTML = '<p>Error loading post. Please try again later.</p><a href="blog.html">&larr; Back to Blog</a>';
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
});
