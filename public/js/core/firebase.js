import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, linkWithPopup, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, collection, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

window.firebaseCore = {
    initializeApp, getAuth, onAuthStateChanged, signInAnonymously,
    getFirestore, doc, collection, onSnapshot, setDoc, deleteDoc, serverTimestamp,
    GoogleAuthProvider, linkWithPopup, signInWithPopup, signOut
};

window.upgradeToGoogle = async () => {
    const btn = document.querySelector('button[title="Verify Identity"]');
    const auth = window.firebaseCore.getAuth();

    if (auth.currentUser && !auth.currentUser.isAnonymous) {
        const confirmLogout = confirm("⚠️ COMMANDER: Do you want to terminate this session?");
        if (confirmLogout) {
            window.playTacticalSound('click');
            await window.firebaseCore.signOut(auth);
            window.location.reload();
        }
        return;
    }

    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin text-2xl text-yellow-500"></i>';
    const provider = new window.firebaseCore.GoogleAuthProvider();

    try {
        const result = await window.firebaseCore.signInWithPopup(auth, provider);
        const user = result.user;

        const idEl = document.getElementById('neural-id');
        let safeName = user.displayName || user.email.split('@')[0];
        if (idEl) {
            idEl.innerText = `ID: ${safeName.toUpperCase()}`;
            idEl.classList.remove('text-slate-500');
            idEl.classList.add('text-emerald-400', 'drop-shadow-glow');
        }

        if (user.photoURL) {
            btn.innerHTML = `<img src="${user.photoURL}" class="w-8 h-8 rounded-full border-2 border-emerald-500 shadow-[0_0_10px_#10b981] hover:border-red-500 transition-colors" title="Click to Logout">`;
        } else {
            btn.innerHTML = `<i class="fas fa-user-check text-2xl text-emerald-500"></i>`;
        }

        window.playTacticalSound('success');
        if (window.personalizeSession) window.personalizeSession(user);
        if (window.showToast) window.showToast(`WELCOME COMMANDER ${user.displayName.split(' ')[0].toUpperCase()}`, 'success');

    } catch (error) {
        console.error("Login Error:", error);
        btn.innerHTML = originalContent;
        if (error.code === 'auth/popup-closed-by-user') return;
        if (error.code === 'auth/popup-blocked') {
            alert("Security Warning: Popup Blocked. Please allow popups for this site.");
            return;
        }
        alert("LOGIN ERROR: " + error.message);
    }
};
