// 1. Inicializar Supabase (Conectando el cerebro con el almacén)
const { createClient } = supabase;
const _supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

const mainApp = document.getElementById('main-app');

// 2. Gestión del ID de Dispositivo (Nuestra "matrícula" anónima)
function getDeviceId() {
    let id = localStorage.getItem('libroselva_device_id');
    if (!id) {
        id = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('libroselva_device_id', id);
    }
    return id;
}

const deviceId = getDeviceId();

// 3. Sistema de Rutas
const router = {
    home: () => {
        window.location.hash = '';
        renderFeed();
    },
    newPost: () => {
        window.location.hash = 'new';
        renderNewPostForm();
    }
};

// 4. Lógica de Supabase: Obtener Posts (Leer del almacén)
async function fetchPosts() {
    const { data, error } = await _supabase
        .from('posts')
        .select(`
            *,
            likes (count)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error al buscar rugidos:", error);
        return [];
    }
    return data;
}

// 5. Lógica de Supabase: Publicar Post (Guardar en el almacén)
async function handlePublish() {
    const content = document.getElementById('post-content').value;
    const btn = document.getElementById('btn-publish');

    if (!content.trim()) return alert("¡El rugido no puede estar vacío!");

    btn.disabled = true;
    btn.innerText = "Rugiendo... 🐾";

    const { error } = await _supabase
        .from('posts')
        .insert([{ content, author_id: deviceId }]);

    if (error) {
        alert("Oh no, la selva está saturada. Inténtalo de nuevo.");
        btn.disabled = false;
        btn.innerText = "Publicar Rugido 🦁";
    } else {
        router.home();
    }
}

// 6. Lógica de Supabase: Dar Like (Votar)
async function handleLike(postId, btn) {
    const { error } = await _supabase
        .from('likes')
        .insert([{ post_id: postId, device_id: deviceId }]);

    if (error) {
        if (error.code === '23505') {
            alert("¡Ya has dado tu rugido de apoyo a este post! 🐾");
        } else {
            console.error("Error al dar like:", error);
        }
    } else {
        // Actualizar UI rápidamente
        const countSpan = btn.querySelector('.like-count');
        countSpan.innerText = parseInt(countSpan.innerText) + 1;
        btn.classList.add('active');
    }
}

// 6.1. Lógica de Expansión: Eliminar y Destacar
async function handleDelete(postId) {
    if (!confirm("¿Seguro que quieres borrar este rugido de la historia? 🌪️")) return;

    const { error } = await _supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        alert("No se pudo borrar. Tal vez el viento sopló muy fuerte.");
    } else {
        renderFeed();
    }
}

async function handleHighlight(postId, currentStatus) {
    const { error } = await _supabase
        .from('posts')
        .update({ is_featured: !currentStatus })
        .eq('id', postId);

    if (error) {
        alert("No se pudo destacar. Inténtalo de nuevo.");
    } else {
        renderFeed();
    }
}

// 7. Renderizado: El Feed
async function renderFeed() {
    mainApp.innerHTML = `
        <div class="feed-header">
            <h2 style="margin-bottom: 2rem;">Últimos Rugidos</h2>
        </div>
        <div id="posts-container">
            <p style="text-align: center; opacity: 0.5;">Escuchando a los animales... 🐾</p>
        </div>
    `;

    const posts = await fetchPosts();
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.5;">La selva está en silencio por ahora...</p>';
        return;
    }

    posts.forEach(post => {
        const date = new Date(post.created_at).toLocaleDateString();
        const likeCount = post.likes[0] ? post.likes[0].count : 0;
        const isOwner = post.author_id === deviceId;
        const isFeatured = post.is_featured;

        const postEl = document.createElement('div');
        postEl.className = `post ${isFeatured ? 'featured' : ''}`;
        postEl.id = `post-${post.id}`;

        postEl.innerHTML = `
            <div class="post-content">${post.content}</div>
            <div class="post-meta">
                <span>${date}</span>
                <button class="btn-like ${likeCount > 0 ? 'active' : ''}" id="like-${post.id}">
                    ❤️ <span class="like-count">${likeCount}</span>
                </button>
            </div>
            <div class="post-actions">
                <button class="btn-action btn-highlight" onclick="handleHighlight('${post.id}', ${isFeatured})">
                    ${isFeatured ? '⭐ Quitar' : '⭐ Destacar'}
                </button>
                ${isOwner ? `
                <button class="btn-action btn-delete" onclick="handleDelete('${post.id}')">
                    🗑️ Eliminar
                </button>
                ` : ''}
            </div>
        `;

        // El botón de like ya tiene su lógica
        postEl.querySelector('.btn-like').onclick = function (e) {
            e.stopPropagation();
            handleLike(post.id, this);
        };

        container.appendChild(postEl);
    });
}

// 8. Renderizado: Nuevo Post
function renderNewPostForm() {
    mainApp.innerHTML = `
        <div class="form-container">
            <h2 style="margin-bottom: 1.5rem;">Crea tu Rugido</h2>
            <textarea id="post-content" rows="4" placeholder="¿Qué está pasando en la selva?"></textarea>
            <button onclick="handlePublish()" id="btn-publish">Publicar Rugido 🦁</button>
        </div>
    `;
}

// Inicialización
window.addEventListener('load', () => {
    if (window.location.hash.includes('new')) {
        renderNewPostForm();
    } else {
        renderFeed();
    }
});

window.addEventListener('hashchange', () => {
    if (window.location.hash.includes('new')) {
        renderNewPostForm();
    } else {
        renderFeed();
    }
});
