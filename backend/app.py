from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Transaction, SavingsGoal, User
import os
from dotenv import load_dotenv
import jwt
from functools import wraps
from datetime import datetime, timedelta
from sqlalchemy import func

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Setup
basedir = os.path.abspath(os.path.dirname(__file__))
# Use Supabase URI if provided, otherwise fallback to local SQLite for safety/development
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SUPABASE_DATABASE_URI', 'sqlite:///' + os.path.join(basedir, 'finance.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-only-secret-change-this-32chars')

db.init_app(app)

with app.app_context():
    db.create_all()

# --- AUTH DECORATOR ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        authorization = request.headers.get('Authorization', '')
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            token = parts[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Invalid token user!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# --- AUTH ROUTES ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token, 'email': user.email})

# --- PROTECTED ROUTES ---
@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions(current_user):
    query = Transaction.query.filter_by(user_id=current_user.id)
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    try:
        if start_date:
            query = query.filter(Transaction.date >= datetime.strptime(start_date, '%Y-%m-%d'))
        if end_date:
            query = query.filter(Transaction.date < datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1))
    except ValueError:
        return jsonify({'message': 'Dates must use YYYY-MM-DD format'}), 400
    transactions = query.order_by(Transaction.date.desc()).all()
    return jsonify([t.to_dict() for t in transactions])


def validate_transaction(data):
    if not isinstance(data, dict):
        return None, 'A JSON object is required'
    try:
        amount = float(data.get('amount'))
    except (TypeError, ValueError):
        return None, 'Amount must be a positive number'
    if amount <= 0:
        return None, 'Amount must be a positive number'
    if data.get('type') not in ('income', 'expense'):
        return None, 'Type must be income or expense'
    category = str(data.get('category', '')).strip()
    if not category:
        return None, 'Category is required'
    try:
        date_obj = datetime.strptime(data['date'], '%Y-%m-%d') if data.get('date') else datetime.utcnow()
    except (KeyError, TypeError, ValueError):
        return None, 'Date must use YYYY-MM-DD format'
    notes = str(data.get('notes', '')).strip()
    if len(category) > 100 or len(notes) > 255:
        return None, 'Category or notes is too long'
    return {'amount': amount, 'type': data['type'], 'category': category, 'date': date_obj, 'notes': notes}, None

@app.route('/api/transactions', methods=['POST'])
@token_required
def add_transaction(current_user):
    values, error = validate_transaction(request.get_json(silent=True))
    if error:
        return jsonify({'message': error}), 400
    new_tx = Transaction(**values, user_id=current_user.id)
    db.session.add(new_tx)
    db.session.commit()
    return jsonify(new_tx.to_dict()), 201


@app.route('/api/transactions/<int:id>', methods=['PUT'])
@token_required
def update_transaction(current_user, id):
    tx = Transaction.query.filter_by(id=id, user_id=current_user.id).first()
    if not tx:
        return jsonify({'message': 'Transaction not found'}), 404
    values, error = validate_transaction(request.get_json(silent=True))
    if error:
        return jsonify({'message': error}), 400
    for key, value in values.items():
        setattr(tx, key, value)
    db.session.commit()
    return jsonify(tx.to_dict())

@app.route('/api/transactions/<int:id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user, id):
    tx = Transaction.query.filter_by(id=id, user_id=current_user.id).first()
    if not tx:
        return jsonify({"message": "Transaction not found"}), 404
    db.session.delete(tx)
    db.session.commit()
    return jsonify({"message": "Transaction deleted"}), 200

@app.route('/api/summary', methods=['GET'])
@token_required
def get_summary(current_user):
    transactions = Transaction.query.filter_by(user_id=current_user.id).all()
    income = sum(t.amount for t in transactions if t.type == 'income')
    expense = sum(t.amount for t in transactions if t.type == 'expense')
    balance = income - expense

    # Today's summary
    today = datetime.utcnow().date()
    today_txs = [t for t in transactions if t.date.date() == today]
    today_income = sum(t.amount for t in today_txs if t.type == 'income')
    today_expense = sum(t.amount for t in today_txs if t.type == 'expense')
    today_saved = today_income - today_expense if today_income - today_expense > 0 else 0

    return jsonify({
        "total_balance": balance,
        "total_income": income,
        "total_expense": expense,
        "today_earned": today_income,
        "today_spent": today_expense,
        "today_saved": today_saved
    })

@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    transactions = Transaction.query.filter_by(user_id=current_user.id).all()
    
    # Category totals
    category_totals = {}
    for t in transactions:
        if t.type == 'expense':
            category_totals[t.category] = category_totals.get(t.category, 0) + t.amount
            
    # Format for Pie Chart
    pie_data = [{"name": k, "value": v} for k, v in category_totals.items()]

    # Monthly Trends (Bar Chart)
    monthly_totals = {}
    for t in transactions:
        month_key = t.date.strftime("%Y-%m")
        if month_key not in monthly_totals:
            monthly_totals[month_key] = {"name": t.date.strftime("%b %Y"), "income": 0, "expense": 0}
        
        if t.type == 'income':
            monthly_totals[month_key]["income"] += t.amount
        else:
            monthly_totals[month_key]["expense"] += t.amount

    # Ensure orderly list based on calendar (Simplified: just returning what we have)
    bar_data = [monthly_totals[key] for key in sorted(monthly_totals)]

    return jsonify({
        "pie_data": pie_data,
        "bar_data": bar_data
    })

@app.route('/api/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    alerts = []
    # 1. Compare daily spending with daily average over past 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    expenses = Transaction.query.filter(Transaction.type == 'expense', Transaction.user_id == current_user.id).all()
    
    recent_expenses = [e for e in expenses if e.date >= thirty_days_ago]
    today = datetime.utcnow().date()
    
    today_expense = sum(e.amount for e in recent_expenses if e.date.date() == today)
    
    if recent_expenses:
        total_30_days = sum(e.amount for e in recent_expenses)
        daily_avg = total_30_days / 30.0
        
        if today_expense > daily_avg * 1.5 and today_expense > 0: # threshold: 50% more than average
            alerts.append({
                "title": "High Daily Spending",
                "message": f"You spent ₹{today_expense:.2f} today, which is higher than your daily average of ₹{daily_avg:.2f}.",
                "suggestion": "Try reducing spending tomorrow to balance it out."
            })

    # 2. Category spike
    # Find highest category this week vs last week
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    two_weeks_ago = datetime.utcnow() - timedelta(days=14)
    
    this_week_exp = {}
    last_week_exp = {}
    
    for e in expenses:
        if one_week_ago <= e.date:
            this_week_exp[e.category] = this_week_exp.get(e.category, 0) + e.amount
        elif two_weeks_ago <= e.date < one_week_ago:
            last_week_exp[e.category] = last_week_exp.get(e.category, 0) + e.amount

    for cat, amt in this_week_exp.items():
        last_week_amt = last_week_exp.get(cat, 0)
        if amt > last_week_amt * 1.5 and amt > 100: # spent 50% more than last week, ignore small amounts
            alerts.append({
                "title": f"Category Spike: {cat}",
                "message": f"Your {cat.lower()} expenses are higher this week (₹{amt:.2f}) compared to last week (₹{last_week_amt:.2f}).",
                "suggestion": f"Try reducing spending in {cat.lower()} to stay on track."
            })
            
    if not alerts:
        alerts.append({
            "title": "On Track!",
            "message": "Your spending is normal. Keep it up!",
            "suggestion": "No immediate actions needed."
        })

    return jsonify(alerts)

@app.route('/api/goals', methods=['GET', 'POST'])
@token_required
def manage_goals(current_user):
    goal = SavingsGoal.query.filter_by(user_id=current_user.id).first()
    
    if request.method == 'GET':
        if not goal:
            return jsonify({"target_amount": 0, "name": "Savings Goal"})
        return jsonify(goal.to_dict())
        
    if request.method == 'POST':
        data = request.json
        if not goal:
            goal = SavingsGoal(target_amount=float(data['target_amount']), name=data.get('name', 'Savings Goal'), user_id=current_user.id)
            db.session.add(goal)
        else:
            goal.target_amount = float(data['target_amount'])
            if 'name' in data:
                goal.name = data['name']
                
        db.session.commit()
        return jsonify(goal.to_dict())

@app.route('/')
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Savynx API is running',
        'api_base': '/api'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
