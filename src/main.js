import { db } from './firebase-config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";

class KeepApp {
  constructor() {
    this.notes = [];
    this.user = JSON.parse(localStorage.getItem('keep-user')) || null;
    this.isExpanded = false;
    this.selectedColor = 'var(--note-default)';

    // Hardcoded credentials
    this.CREDENTIALS = {
      username: 'Selai',
      password: 'Kacang'
    };

    // DOM Elements
    this.noteInputContainer = document.getElementById("note-input-container");
    this.noteTitle = document.getElementById("note-title");
    this.noteContent = document.getElementById("note-content");
    this.btnSave = document.getElementById("btn-save");
    this.notesContainer = document.getElementById("notes-container");
    this.searchInput = document.getElementById("search-input");
    
    // Auth Elements
    this.btnLogin = document.getElementById("btn-login");
    this.btnLogout = document.getElementById("btn-logout");
    this.userInfo = document.getElementById("user-info");
    this.userPhoto = document.getElementById("user-photo");
    this.userName = document.getElementById("user-name");

    // Login Modal Elements
    this.loginModal = document.getElementById("login-modal");
    this.usernameInput = document.getElementById("username");
    this.passwordInput = document.getElementById("password");
    this.btnSubmitLogin = document.getElementById("btn-submit-login");

    this.colorOptions = ['default', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'darkblue', 'purple', 'pink', 'brown', 'gray'];

    this.init();
    
    // Auto-save detection
    this.lastSavedContent = "";
  }

  init() {
    this.addEventListeners();
    this.checkAuth();
  }

  checkAuth() {
    if (this.user) {
      this.showLoggedInUI();
      this.fetchNotes();
    } else {
      this.showLoggedOutUI();
    }
  }

  showLoggedInUI() {
    this.btnLogin.classList.add('hidden');
    this.userInfo.classList.remove('hidden');
    this.userPhoto.src = `https://ui-avatars.com/api/?name=${this.user.displayName}&background=fbbc04&color=fff`;
    this.userName.textContent = this.user.displayName;
    this.loginModal.classList.add('hidden');
  }

  showLoggedOutUI() {
    this.btnLogin.classList.remove('hidden');
    this.userInfo.classList.add('hidden');
  }

  addEventListeners() {
    // Show login modal
    this.btnLogin.addEventListener('click', () => {
      this.loginModal.classList.remove('hidden');
      this.usernameInput.focus();
    });

    // Submit login
    this.btnSubmitLogin.addEventListener('click', () => {
      this.handleLogin();
    });

    // Close modal on outside click
    this.loginModal.addEventListener('click', (e) => {
      if (e.target === this.loginModal) {
        this.loginModal.classList.add('hidden');
      }
    });

    // Logout
    this.btnLogout.addEventListener('click', () => {
      this.handleLogout();
    });

    this.noteInputContainer.addEventListener("click", (e) => {
      if (!this.isExpanded) this.expandInput();
    });

    this.btnSave.addEventListener("click", (e) => {
      e.stopPropagation();
      this.saveNote();
      this.collapseInput();
    });

    document.addEventListener("click", (e) => {
      if (!this.noteInputContainer.contains(e.target) && this.isExpanded) {
        this.saveNote();
        this.collapseInput();
      }
    });

    this.searchInput.addEventListener("input", (e) => {
      this.renderNotes(e.target.value);
    });

    this.noteContent.addEventListener("input", () => {
      this.noteContent.style.height = "auto";
      this.noteContent.style.height = this.noteContent.scrollHeight + "px";
    });
  }

  handleLogin() {
    const usn = this.usernameInput.value.trim();
    const pwd = this.passwordInput.value.trim();

    if (usn === this.CREDENTIALS.username && pwd === this.CREDENTIALS.password) {
      this.user = { 
        uid: 'user-selai-sync-id', // Static ID for multi-device sync
        displayName: 'Selai' 
      };
      localStorage.setItem('keep-user', JSON.stringify(this.user));
      this.showLoggedInUI();
      this.fetchNotes();
      this.usernameInput.value = '';
      this.passwordInput.value = '';
    } else {
      alert("Username atau Password salah!");
    }
  }

  handleLogout() {
    this.user = null;
    localStorage.removeItem('keep-user');
    this.showLoggedOutUI();
    this.notes = [];
    this.renderNotes();
  }

  expandInput() {
    if (!this.user) {
      this.loginModal.classList.remove('hidden');
      return;
    }
    this.isExpanded = true;
    this.noteInputContainer.classList.add("expanded");
    this.noteContent.focus();
  }

  collapseInput() {
    this.isExpanded = false;
    this.noteInputContainer.classList.remove("expanded");
    this.noteInputContainer.style.backgroundColor = 'var(--note-default)';
    this.noteTitle.value = "";
    this.noteContent.value = "";
    this.noteContent.style.height = "auto";
    this.selectedColor = 'var(--note-default)';
  }

  async saveNote() {
    if (!this.user) return;
    const title = this.noteTitle.value.trim();
    const content = this.noteContent.value.trim();

    if (title || content) {
      const newNote = {
        userId: this.user.uid,
        title,
        content,
        color: this.selectedColor,
        isPinned: false,
        createdAt: new Date()
      };
      
    this.btnSave.disabled = true;
    this.btnSave.textContent = "Menyimpan...";
    
    try {
      await addDoc(collection(db, "notes"), newNote);
      this.collapseInput(); 
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Gagal menyimpan catatan: " + e.message + "\n\nPastikan Anda sudah mengatur Firestore Rules ke 'allow read, write: if true;' di Firebase Console.");
    } finally {
      this.btnSave.disabled = false;
      this.btnSave.textContent = "Tutup";
    }
    }
  }

  fetchNotes() {
    const q = query(
      collection(db, "notes"), 
      where("userId", "==", this.user.uid),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
      this.notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.renderNotes();
    }, (err) => {
      console.error("Fetch Error:", err);
      if (err.code === 'permission-denied') {
        alert("Akses Firestore ditolak. Hubungi admin atau periksa Firebase Rules.");
      }
    });
  }

  async deleteNote(id) {
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (e) {
      console.error("Delete Error:", e);
    }
  }

  async togglePin(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      try {
        await updateDoc(doc(db, "notes", id), {
          isPinned: !note.isPinned
        });
      } catch (e) {
        console.error("Pin Error:", e);
      }
    }
  }

  async updateNoteColor(id, colorName) {
    const colorVar = `var(--note-${colorName})`;
    try {
      await updateDoc(doc(db, "notes", id), {
        color: colorVar
      });
    } catch (e) {
      console.error("Color Error:", e);
    }
  }

  setInputColor(colorName) {
    this.selectedColor = `var(--note-${colorName})`;
    this.noteInputContainer.style.backgroundColor = this.selectedColor;
  }

  renderNotes(searchTerm = "") {
    this.notesContainer.innerHTML = "";

    let filteredNotes = this.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    filteredNotes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    if (filteredNotes.length === 0) {
        if (!this.user) {
            this.notesContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); margin-top: 40px;">Silakan login untuk melihat dan membuat catatan.</div>';
        } else if (!searchTerm) {
            this.notesContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); margin-top: 40px;">Catatan yang Anda tambahkan akan muncul di sini.</div>';
        }
        return;
    }

    filteredNotes.forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.className = `note-card ${note.isPinned ? 'pinned' : ''}`;
      noteCard.style.backgroundColor = note.color;

      noteCard.innerHTML = `
        <div class="pin-btn ${note.isPinned ? 'active' : ''}" onclick="event.stopPropagation(); app.togglePin('${note.id}')">
           <svg width="20" height="20" viewBox="0 0 24 24"><path d="M16 5h.99L17 5l1 1v11h-2l-1 1H9l-1-1H6V6l1-1h1V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v1zm-4 0h2V4h-2v1z"></path></svg>
        </div>
        ${note.title ? `<div class="note-card-title">${note.title}</div>` : ""}
        <div class="note-card-content">${note.content}</div>
        <div class="card-actions">
           <div class="icon-btn" onclick="event.stopPropagation(); app.deleteNote('${note.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
          </div>
          <div class="color-picker-trigger icon-btn">
             <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"></path></svg>
             <div class="color-palette">
                ${this.colorOptions.map(c => `<div class="color-swatch" style="background-color: var(--note-${c})" onclick="event.stopPropagation(); app.updateNoteColor('${note.id}', '${c}')"></div>`).join('')}
             </div>
          </div>
        </div>
      `;
      this.notesContainer.appendChild(noteCard);
    });
  }
}

const app = new KeepApp();
window.app = app;
