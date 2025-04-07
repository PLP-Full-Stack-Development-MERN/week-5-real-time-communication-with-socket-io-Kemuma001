import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io("http://localhost:5000"); // Make sure your backend is running on port 5000

const NoteEditor = () => {
  const [roomId, setRoomId] = useState('');
  const [note, setNote] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Listen for updates to the note from other users
    socket.on('noteUpdated', (updatedNote) => {
      setNote(updatedNote);
    });

    // Listen for users in the room
    socket.on('roomUsers', (roomUsers) => {
      setUsers(roomUsers);
    });

    return () => {
      socket.off('noteUpdated');
      socket.off('roomUsers');
    };
  }, []);

  const handleRoomChange = (event) => {
    setRoomId(event.target.value);
  };

  const handleJoinRoom = () => {
    if (roomId) {
      socket.emit('joinRoom', roomId);
    }
  };

  const handleNoteChange = (event) => {
    setNote(event.target.value);
    socket.emit('updateNote', note, roomId);
  };

  return (
    <div>
      <h1>Collaborative Notes</h1>

      {/* Room ID input */}
      <div>
        <input
          type="text"
          value={roomId}
          onChange={handleRoomChange}
          placeholder="Enter Room ID"
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>

      {/* Note editor */}
      <div>
        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder="Write your notes here..."
        />
      </div>

      {/* List of users in the room */}
      <div>
        <h2>Users in this room:</h2>
        <ul>
          {users.map((user) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NoteEditor;
