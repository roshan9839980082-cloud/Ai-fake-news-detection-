import os
import requests
from bson import ObjectId
from flask.cli import load_dotenv
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify, session, redirect, url_for  
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
load_dotenv()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'Page'),
    static_folder=BASE_DIR,
    static_url_path=''
)
app.secret_key = os.getenv('Secret_key')

# --- MongoDB Atlas Connection ---
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['newsguard_db']
users_collection = db['users']
history_collection = db['history']
saved_collection = db["saved_articles"]


try:
    client.admin.command('ping')
    print("\n>>> MongoDB Atlas Cloud Successfully Connected! <<<\n")
except Exception as e:
    print(f"\nMongoDB Connection Error: {e}\n")


# --- GEMINI API SETUP ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

# Gemini model select kar rahe hain
ai_model = genai.GenerativeModel('gemini-3.5-flash')


# --- NEWS CHECK ROUTE ---
@app.route('/check-news', methods=['POST'])
def check_news():

    # User login check
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Please login first!'
        }), 401

    data = request.get_json()
    news_text = data.get('query', '').strip()

    if not news_text:
        return jsonify({
            'success': False,
            'error': 'Please enter some news to check!'
        }), 400

    # Gemini prompt
    prompt = f"""
    You are an expert fact-checking AI.

    Analyze the following news or claim.

    Classify it into exactly ONE of these categories:
    Real
    Fake
    Misleading
    Unverified

    Give a short explanation in 2-3 sentences.

    News Claim:
    "{news_text}"

    Format the output exactly like this:

    Status: [Real/Fake/Misleading/Unverified]
    Explanation: [Your explanation here]
    """

    try:

        # Gemini analysis
        response = ai_model.generate_content(prompt)

        result_text = response.text.strip()

        # Default status
        status = "Unverified"

        # First line check
        first_line = result_text.split("\n")[0].lower()

        if "misleading" in first_line:
            status = "Misleading"

        elif "fake" in first_line:
            status = "False"

        elif "real" in first_line:
            status = "True"

        elif "unverified" in first_line:
            status = "Unverified"

        # Save history in MongoDB
        history_collection.insert_one({
            'user_id': session['user_id'],
            'article': news_text,
            'status': status,
            'result': result_text,
            'created_at': __import__('datetime').datetime.now()
        })

        # Send result to frontend
        return jsonify({
            'success': True,
            'status': status,
            'result': result_text
        })

    except Exception as e:

        print("News Analysis Error:", e)

        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# --- Signup Route ---
@app.route('/signup.html', methods=['GET', 'POST'])
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not username or not email or not password:
            return "All fields are required!", 400

        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return "Email already exists!", 400

        hashed_password = generate_password_hash(password)

        try:
            users_collection.insert_one({
                'username': username,
                'email': email,
                'password': hashed_password
            })
        except Exception as e:
            return f"MongoDB Error: {e}", 500

        return redirect('/login')

    return render_template('signup.html')

# --- SAVE ARTICLE ROUTE ---
@app.route('/api/save-article', methods=['POST'])
def save_article():
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Please login first!'
        }), 401

    data = request.get_json()
    text = data.get('text', '').strip()
    status = data.get('status', '').strip()
    explanation = data.get('explanation', '').strip()

    if not text:
        return jsonify({
            'success': False,
            'error': 'Article text is required!'
        }), 400

    try:
        saved_collection.insert_one({
            'user_id': session['user_id'],
            'text': text,
            'status': status,
            'explanation': explanation,
            'saved_at': __import__('datetime').datetime.now()
        })

        return jsonify({
            'success': True,
            'message': 'Article saved successfully!'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# --- GET SAVED ARTICLES ROUTE ---
@app.route('/api/get-saved-articles', methods=['GET'])
def get_saved_articles():
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401

    try:
        user_saved = saved_collection.find(
            {'user_id': session['user_id']}
        ).sort('saved_at', -1)

        articles_data = []
        for item in user_saved:
            articles_data.append({
                'id': str(item['_id']),
                'text': item.get('text'),
                'status': item.get('status'),
                'explanation': item.get('explanation'),
                'saved_at': item['saved_at'].strftime('%d %b %Y, %I:%M %p') if 'saved_at' in item else ''
            })

        return jsonify({
            'success': True,
            'articles': articles_data
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# --- SAVED ARTICLES PAGE ROUTE ---
@app.route('/saved.html')
def saved_page():
    if 'user_id' not in session:
        return redirect('/login')
    return render_template('saved.html')

# --- UNSAVE / DELETE ARTICLE ROUTE ---
@app.route('/api/delete-article/<article_id>', methods=['DELETE'])
def delete_article(article_id):
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401

    try:
        # User id check karna zaroori hai taaki koi dusra user kisi aur ka article na uda sake
        result = saved_collection.delete_one({
            '_id': ObjectId(article_id),
            'user_id': session['user_id']
        })

        if result.deleted_count > 0:
            return jsonify({
                'success': True,
                'message': 'Article unsaved successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Article not found or unauthorized!'
            }), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# --- DELETE HISTORY ITEM ROUTE ---
@app.route('/api/history/<item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401

    try:
        result = history_collection.delete_one({
            '_id': ObjectId(item_id),
            'user_id': session['user_id']
        })

        if result.deleted_count > 0:
            return jsonify({
                'success': True,
                'message': 'History item deleted successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Item not found or unauthorized!'
            }), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# --- LOGIN ROUTE ---
@app.route('/login.html', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = users_collection.find_one({'email': email})

        if user and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            session['username'] = user['username']
            session['email'] = user['email']
            return redirect('/')
        else:
            return "Invalid Email or Password!", 401

    return render_template('login.html')

# --- HISTORY PAGE ---
@app.route('/history.html')
def history():

    if 'user_id' not in session:
        return redirect('/login')

    return render_template('history.html')

# --- GET USER HISTORY ---
@app.route('/api/history')
def get_history():

    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401

    try:

        user_history = history_collection.find(
            {'user_id': session['user_id']}
        ).sort('created_at', -1)

        history_data = []

        for item in user_history:

            history_data.append({
                'id': str(item['_id']),
                'article': item['article'],
                'status': item['status'],
                'result': item['result'],
                'created_at': item['created_at'].strftime('%d %b %Y, %I:%M %p')
            })

        return jsonify({
            'success': True,
            'history': history_data
        })

    except Exception as e:

        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# --- HOME ROUTE ---
@app.route('/')
def home():
    if 'user_id' in session:
        return render_template('index.html', username=session['username'])
    return redirect('/login.html')

# --- LOGOUT ROUTE ---
@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

# --- UPDATE PROFILE ROUTE ---
@app.route('/update-profile', methods=['POST'])
def update_profile():
    # Check karein ki user logged-in hai ya nahi
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized user'}), 401

    try:
        data = request.get_json()
        full_name = data.get('fullName')
        email = data.get('email') # Yeh read-only email hai jo frontend se aayega
        bio = data.get('bio')

        if not full_name:
            return jsonify({'error': 'Full name cannot be empty!'}), 400

        # MongoDB database mein user data update karein email ke through
        result = users_collection.update_one(
            {'email': email},
            {
                '$set': {
                    'username': full_name,
                    'bio': bio
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({'error': 'User not found in database!'}), 404

        # Session ke username ko bhi update kar dein taaki page par naya name reflect ho
        session['username'] = full_name

        return jsonify({'message': 'Profile updated successfully!'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- PROFILE ROUTE ---
@app.route('/profile.html', methods=['GET'])
def profile():
    if 'user_id' not in session:
        return redirect('/login')
    
    # Database se current logged-in user ka data nikal lo
    user = users_collection.find_one({'_id': ObjectId(session['user_id'])})
    
    # Template ko user object pass kar do
    return render_template('profile.html', user=user)

# --- FAQ AI SEARCH ROUTE ---
@app.route('/api/faq-ai', methods=['POST'])
def faq_ai():
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Please login first!'
        }), 401

    data = request.get_json()
    query = data.get('query', '').strip()

    if not query:
        return jsonify({
            'success': False,
            'error': 'Query cannot be empty!'
        }), 400

    prompt = f"""
    You are an intelligent support assistant for NewsGuard AI. 
    A user is searching the FAQ section and asked the following question: "{query}".
    Provide a concise, helpful, and clear answer explaining how it works regarding NewsGuard AI.
    """

    try:
        response = ai_model.generate_content(prompt)
        answer = response.text.strip()

        return jsonify({
            'success': True,
            'answer': answer
        })
    except Exception as e:
        print("FAQ AI Error:", e)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recent-news', methods=['GET'])
def get_recent_news():
    api_key = os.getenv('GNEWS_API_KEY') # Yahan apni GNews/NewsAPI key dalein
    print("DEBUG API KEY:", api_key)  #Check karo terminal me key print ho rahi hai ya None aa raha hai
    url = f'https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=3&apikey={api_key}'
    
    try:
        response = requests.get(url)
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Generic page loader
@app.route('/<page_name>', methods=['GET'])
def render_page(page_name):
    if not page_name.endswith('.html'):
        page_name += '.html'
    try:
        return render_template(page_name)
    except:
        return "Page not found!", 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)
