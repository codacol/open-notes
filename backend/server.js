const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');

const { GoogleGenAI, Type } = require('@google/genai');
const SYSTEM_INSTRUCTION = `
You are an intelligent personal assistant and note-taking expert.
Your goal is to analyze natural language input and convert it into a structured note.
1. DETECT the language of the input text.
2. EXTRACT a concise and descriptive 'title' IN THE SAME LANGUAGE AS THE INPUT.
3. CREATE a clean 'content' body formatted in Markdown IN THE SAME LANGUAGE AS THE INPUT. Use headers (#), lists (-), and bold (**).
4. GENERATE relevant 'tags' (maximum 5) in the SAME LANGUAGE.
5. IDENTIFY any actionable tasks or action items and extract them as 'todos' in the SAME LANGUAGE.
6. For each todo, if a specific time or date is mentioned (e.g., "next Friday", "tomorrow at 5pm", "in 2 days"), extract it into the 'reminder' field.
`;

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
const allowedOrigins = [
  process.env.WEB_APP_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Input validation helper
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Simple password hashing using crypto (built-in)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// --- Routes ---

// Gemini
app.post('/api/generate-note', async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).json({ error: "text is required" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured on backend" });

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            todos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  reminder: { type: Type.STRING, nullable: true }
                },
                required: ["text"]
              }
            }
          },
          required: ["title", "content", "tags", "todos"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    res.json(JSON.parse(jsonText));
  } catch (err) {
    console.error("Error generating note:", err);
    res.status(500).json({ error: "Failed to generate note" });
  }
});

// Auth
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const hashedPassword = hashPassword(password);

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!row) return res.status(401).json({ error: "Invalid credentials" });
      
      // Compare hashed password
      if (row.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Don't send password back
      const { password: _, ...user } = row;
      res.json(user);
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields required" });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    // Hash password
    const hashedPassword = hashPassword(password);
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    
    db.run("INSERT INTO users (id, name, email, password, avatar) VALUES (?, ?, ?, ?, ?)", 
      [id, name, email, hashedPassword, avatar], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: "Server error" });
        }
        res.json({ id, name, email, avatar });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Users
app.get('/api/users', (req, res) => {
  db.all("SELECT id, name, email, avatar FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(rows);
  });
});

app.get('/api/users/:id', (req, res) => {
  db.get("SELECT id, name, email, avatar FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (!row) return res.status(404).json({ error: "User not found" });
    res.json(row);
  });
});

// Note Types
app.get('/api/types', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  
  db.all("SELECT * FROM note_types WHERE userId = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(rows);
  });
});

app.post('/api/types', (req, res) => {
  const { name, userId } = req.body;
  
  if (!name || !userId) {
    return res.status(400).json({ error: "name and userId required" });
  }
  
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  db.run("INSERT INTO note_types (id, userId, name) VALUES (?, ?, ?)", [id, userId, name], function(err) {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json({ id, userId, name });
  });
});

app.delete('/api/types/:id', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  
  db.serialize(() => {
    // Verify ownership before deleting
    db.get("SELECT userId FROM note_types WHERE id = ?", [req.params.id], (err, row) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!row) return res.status(404).json({ error: "Type not found" });
      if (row.userId !== userId) return res.status(403).json({ error: "Unauthorized" });
      
      db.run("DELETE FROM note_types WHERE id = ?", [req.params.id]);
      db.run("UPDATE notes SET typeId = NULL WHERE typeId = ?", [req.params.id]);
      res.json({ success: true });
    });
  });
});

// Notes
app.get('/api/notes', (req, res) => {
  const { userId, viewMode, typeId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  
  let sql = "SELECT * FROM notes WHERE 1=1";
  let params = [];

  if (viewMode === 'personal') {
    sql += " AND userId = ?";
    params.push(userId);
  } else if (viewMode === 'shared') {
    sql += " AND sharedWith LIKE ? AND userId != ?";
    params.push(`%"${userId}"%`, userId);
  } else if (viewMode === 'type' && typeId) {
    sql += " AND userId = ? AND typeId = ?";
    params.push(userId, typeId);
  } else {
    // 'all' = owner OR shared
    sql += " AND (userId = ? OR sharedWith LIKE ?)";
    params.push(userId, `%"${userId}"%`);
  }
  
  sql += " ORDER BY updatedAt DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Server error" });
    
    // Parse JSON fields safely
    const notes = rows.map(note => {
      try {
        return {
          ...note,
          tags: JSON.parse(note.tags || '[]'),
          todos: JSON.parse(note.todos || '[]'),
          sharedWith: JSON.parse(note.sharedWith || '[]')
        };
      } catch (e) {
        return {
          ...note,
          tags: [],
          todos: [],
          sharedWith: []
        };
      }
    });
    res.json(notes);
  });
});

app.post('/api/notes', (req, res) => {
  const note = req.body;
  
  if (!note.userId || !note.title) {
    return res.status(400).json({ error: "userId and title required" });
  }
  
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const now = Date.now();
  
  const tags = JSON.stringify(note.tags || []);
  const todos = JSON.stringify(note.todos || []);
  const sharedWith = JSON.stringify(note.sharedWith || []);

  db.run(`INSERT INTO notes (id, userId, typeId, title, content, color, tags, todos, sharedWith, createdAt, updatedAt) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, note.userId, note.typeId || null, note.title, note.content || '', note.color || '#ffffff', tags, todos, sharedWith, now, now],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ 
        ...note, 
        id, 
        createdAt: now, 
        updatedAt: now,
        tags: note.tags || [],
        todos: note.todos || [],
        sharedWith: note.sharedWith || []
      });
    }
  );
});

app.put('/api/notes/:id', (req, res) => {
  const { title, content, color, tags, todos, sharedWith, typeId, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  
  const updatedAt = Date.now();
  
  // Verify ownership before updating
  db.get("SELECT userId FROM notes WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (!row) return res.status(404).json({ error: "Note not found" });
    if (row.userId !== userId) return res.status(403).json({ error: "Unauthorized" });
    
    db.run(`UPDATE notes SET title = ?, content = ?, color = ?, tags = ?, todos = ?, sharedWith = ?, typeId = ?, updatedAt = ? WHERE id = ?`,
      [title, content, color, JSON.stringify(tags || []), JSON.stringify(todos || []), JSON.stringify(sharedWith || []), typeId || null, updatedAt, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: "Server error" });
        res.json({ ...req.body, updatedAt });
      }
    );
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  
  // Verify ownership before deleting
  db.get("SELECT userId FROM notes WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (!row) return res.status(404).json({ error: "Note not found" });
    if (row.userId !== userId) return res.status(403).json({ error: "Unauthorized" });
    
    db.run("DELETE FROM notes WHERE id = ?", [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ success: true });
    });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const path = require('path');

// ---- static files ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- fallback for SPA ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});