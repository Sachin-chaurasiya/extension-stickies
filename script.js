document.addEventListener('DOMContentLoaded', function () {
  const notesContainer = document.getElementById('notes-container');
  const addNoteButton = document.getElementById('add-note');

  // Load existing notes from storage
  chrome.storage.sync.get(['notes'], function (result) {
    const notes = result.notes || [];
    notes.forEach(createNoteElement);
  });

  // Add a new note
  addNoteButton.addEventListener('click', function () {
    const note = {
      id: Date.now(),
      content: '',
    };

    // add check if there are 9 notes already then don't add more
    chrome.storage.sync.get(['notes'], function (result) {
      const notes = result.notes || [];
      if (notes.length >= 9) {
        alert('You can only add 9 notes');
        return;
      } else {
        createNoteElement(note);
        saveNoteToStorage(note);
      }
    });
  });

  // Create a note element
  function createNoteElement(note) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.dataset.id = note.id;

    const textarea = document.createElement('textarea');
    textarea.value = note.content;
    textarea.addEventListener('input', function () {
      note.content = textarea.value;
      saveNoteToStorage(note);
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-note';
    deleteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 delete-icon">
      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
    `;
    deleteButton.addEventListener('click', function () {
      deleteNoteElement(noteElement, note.id);
    });

    noteElement.appendChild(textarea);
    noteElement.appendChild(deleteButton);
    notesContainer.appendChild(noteElement);
  }

  // Save notes to storage
  function saveNoteToStorage(note) {
    chrome.storage.sync.get(['notes'], function (result) {
      const notes = result.notes || [];
      const noteIndex = notes.findIndex((n) => n.id === note.id);
      if (noteIndex === -1) {
        notes.push(note);
      } else {
        notes[noteIndex] = note;
      }
      chrome.storage.sync.set({ notes: notes });
    });
  }

  // Delete a note element
  function deleteNoteElement(noteElement, noteId) {
    notesContainer.removeChild(noteElement);
    chrome.storage.sync.get(['notes'], function (result) {
      const notes = result.notes || [];
      const updatedNotes = notes.filter((note) => note.id !== noteId);
      chrome.storage.sync.set({ notes: updatedNotes });
    });
  }
});

// After you add or delete a note, check if there are any notes left
function updateNoNotesMessage() {
  const noNotesMessage = document.getElementById('no-notes');

  // read the chrome storage and check if there are any notes
  chrome.storage.sync.get(['notes'], function (result) {
    const notes = result.notes || [];
    if (notes.length === 0) {
      noNotesMessage.style.display = 'block';
    } else {
      noNotesMessage.style.display = 'none';
    }
  });
}

// Call this function after adding or deleting a note
updateNoNotesMessage();
