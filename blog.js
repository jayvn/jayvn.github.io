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
            const response = await fetch(`blog/posts/${id}.html`);
            if (!response.ok) {
                 if (response.status === 404) {
                     blogContent.innerHTML = '<p>Post not found.</p><a href="blog.html">&larr; Back to Blog</a>';
                     return;
                 }
                 throw new Error('Failed to load post');
            }
            const content = await response.text();

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
