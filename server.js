const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    
    users.push({ name, email, password });
    res.json({ message: 'Signup successful', user: { name, email } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
