from flask import Flask, request, jsonify, render_template, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from collections import Counter
import os
import jwt
import webbrowser
from threading import Timer
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))

# Supabase Fix: SQLAlchemy requires postgresql:// instead of postgres://
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///' + os.path.join(basedir, 'car_inquiries.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Admin Configuration
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'carfinder2026')
JWT_SECRET = os.environ.get('JWT_SECRET', 'carfinder_jwt_secret_key_2026')
JWT_EXPIRY_HOURS = 24

db = SQLAlchemy(app)

# Models
class CarInquiry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    make = db.Column(db.String(50))
    type = db.Column(db.String(50))
    year = db.Column(db.String(4))
    condition = db.Column(db.String(20))
    kms_driven = db.Column(db.String(50))
    fuel = db.Column(db.String(20))
    transmission = db.Column(db.String(20))
    budget = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'make': self.make,
            'type': self.type,
            'year': self.year,
            'condition': self.condition,
            'kms_driven': self.kms_driven,
            'fuel': self.fuel,
            'transmission': self.transmission,
            'budget': self.budget,
            'created_at': self.created_at.isoformat()
        }

# Security Middleware
def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        # In production, this should always come from environment variables
        expected_key = os.environ.get('ADMIN_API_KEY', 'dev_secret_key')
        
        if api_key and api_key == expected_key:
            return f(*args, **kwargs)
            
        return jsonify({
            'status': 'error', 
            'message': 'Unauthorized: Valid X-API-Key header is required'
        }), 401
    return decorated

def require_admin_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'status': 'error', 'message': 'Missing or invalid Authorization header'}), 401
        
        token = auth_header.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            if payload.get('role') != 'admin':
                raise jwt.InvalidTokenError('Invalid role')
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'status': 'error', 'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

# ─── Admin API Endpoints ───

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        token = jwt.encode({
            'sub': username,
            'role': 'admin',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
        }, JWT_SECRET, algorithm='HS256')

        return jsonify({
            'status': 'success',
            'token': token,
            'username': username
        }), 200
    
    return jsonify({
        'status': 'error',
        'message': 'Invalid username or password'
    }), 401

@app.route('/api/admin/stats', methods=['GET'])
@require_admin_token
def admin_stats():
    total = CarInquiry.query.count()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = CarInquiry.query.filter(CarInquiry.created_at >= today_start).count()

    this_week_start = today_start - timedelta(days=today_start.weekday())
    week_count = CarInquiry.query.filter(CarInquiry.created_at >= this_week_start).count()

    all_inquiries = CarInquiry.query.all()

    make_counts = Counter(i.make for i in all_inquiries if i.make and i.make != 'Not Specified')
    type_counts = Counter(i.type for i in all_inquiries if i.type and i.type != 'Not Specified')
    fuel_counts = Counter(i.fuel for i in all_inquiries if i.fuel and i.fuel != 'Not Specified')
    condition_counts = Counter(i.condition for i in all_inquiries if i.condition and i.condition != 'Not Specified')
    budget_counts = Counter(i.budget for i in all_inquiries if i.budget and i.budget != 'Not Specified')
    transmission_counts = Counter(i.transmission for i in all_inquiries if i.transmission and i.transmission != 'Not Specified')

    top_make = make_counts.most_common(1)[0] if make_counts else ('N/A', 0)
    top_type = type_counts.most_common(1)[0] if type_counts else ('N/A', 0)

    # Recent activity: inquiries per day for the last 7 days
    daily_activity = []
    for i in range(6, -1, -1):
        day = today_start - timedelta(days=i)
        next_day = day + timedelta(days=1)
        count = CarInquiry.query.filter(
            CarInquiry.created_at >= day,
            CarInquiry.created_at < next_day
        ).count()
        daily_activity.append({
            'date': day.strftime('%b %d'),
            'count': count
        })

    return jsonify({
        'total_inquiries': total,
        'today_count': today_count,
        'week_count': week_count,
        'top_make': {'name': top_make[0], 'count': top_make[1]},
        'top_type': {'name': top_type[0], 'count': top_type[1]},
        'breakdown': {
            'makes': dict(make_counts.most_common(10)),
            'types': dict(type_counts.most_common(10)),
            'fuels': dict(fuel_counts.most_common(10)),
            'conditions': dict(condition_counts.most_common(10)),
            'budgets': dict(budget_counts.most_common(10)),
            'transmissions': dict(transmission_counts.most_common(10)),
        },
        'daily_activity': daily_activity
    }), 200

@app.route('/api/admin/inquiries', methods=['GET'])
@require_admin_token
def admin_inquiries():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '', type=str).strip()
    sort_by = request.args.get('sort_by', 'created_at', type=str)
    sort_order = request.args.get('sort_order', 'desc', type=str)

    query = CarInquiry.query

    if search:
        search_filter = f'%{search}%'
        query = query.filter(
            db.or_(
                CarInquiry.name.ilike(search_filter),
                CarInquiry.phone.ilike(search_filter),
                CarInquiry.make.ilike(search_filter),
                CarInquiry.type.ilike(search_filter),
                CarInquiry.fuel.ilike(search_filter),
            )
        )

    # Sorting
    sort_column = getattr(CarInquiry, sort_by, CarInquiry.created_at)
    if sort_order == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'inquiries': [i.to_dict() for i in paginated.items],
        'total': paginated.total,
        'page': paginated.page,
        'per_page': paginated.per_page,
        'total_pages': paginated.pages,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev,
    }), 200

# Sample car data (in a real app, this would come from a database)
SAMPLE_CARS = [
    {
        'id': 1,
        'make': 'Toyota',
        'model': 'Innova Crysta',
        'type': 'suv',
        'year': '2024',
        'condition': 'new',
        'price': 2500000,
        'fuel': 'diesel',
        'transmission': 'automatic',
        'kms_driven': 'below_25000',
        'image': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500',
        'features': ['360 Camera', 'Sunroof', 'Cruise Control', 'Ventilated Seats']
    },
    {
        'id': 2,
        'make': 'Honda',
        'model': 'City',
        'type': 'sedan',
        'year': '2023',
        'condition': 'used',
        'price': 1200000,
        'fuel': 'petrol',
        'transmission': 'manual',
        'kms_driven': '25000_50000',
        'image': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500',
        'features': ['Push Start', 'Sunroof', 'Apple CarPlay', 'Rear AC']
    },
    {
        'id': 3,
        'make': 'Maruti Suzuki',
        'model': 'Swift',
        'type': 'sedan',
        'year': '2024',
        'condition': 'new',
        'price': 800000,
        'fuel': 'cng',
        'transmission': 'manual',
        'kms_driven': 'below_25000',
        'image': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500',
        'features': ['Touchscreen', 'Rear Camera', 'Alloy Wheels']
    },
    {
        'id': 4,
        'make': 'BMW',
        'model': '3 Series',
        'type': 'sedan',
        'year': '2023',
        'condition': 'used',
        'price': 4500000,
        'fuel': 'petrol',
        'transmission': 'automatic',
        'kms_driven': '50000_75000',
        'image': 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=500',
        'features': ['Premium Sound', 'Leather Seats', 'Navigation', 'Sunroof']
    },
    {
        'id': 5,
        'make': 'Hyundai',
        'model': 'Creta',
        'type': 'suv',
        'year': '2024',
        'condition': 'new',
        'price': 1800000,
        'fuel': 'diesel',
        'transmission': 'automatic',
        'kms_driven': 'below_25000',
        'image': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500',
        'features': ['Panoramic Sunroof', 'Ventilated Seats', 'ADAS', 'Digital Cluster']
    },
    {
        'id': 6,
        'make': 'Tata',
        'model': 'Nexon EV',
        'type': 'suv',
        'year': '2024',
        'condition': 'new',
        'price': 1500000,
        'fuel': 'electric',
        'transmission': 'automatic',
        'kms_driven': 'below_25000',
        'image': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500',
        'features': ['Electric Sunroof', 'Connected Car', 'Fast Charging', 'Air Purifier']
    },
    {
        'id': 7,
        'make': 'Ford',
        'model': 'Mustang',
        'type': 'coupe',
        'year': '2023',
        'condition': 'used',
        'price': 7500000,
        'fuel': 'petrol',
        'transmission': 'automatic',
        'kms_driven': '25000_50000',
        'image': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500',
        'features': ['V8 Engine', 'Track Mode', 'Premium Sound', 'Launch Control']
    }
]

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/car-form')
def car_form():
    # Get query parameters
    make = request.args.get('make', '')
    car_type = request.args.get('type', '')
    year = request.args.get('year', '')
    
    return render_template('car-form.html', make=make, type=car_type, year=year)

@app.route('/api/submit-inquiry', methods=['POST'])
def submit_inquiry():
    try:
        data = request.get_json()
        
        # Handle skipped fields by providing defaults
        year = data.get('year') or 'Not Specified'
        kms_driven = data.get('kms_driven') or 'Not Specified'

        # Create new inquiry with fallback values
        inquiry = CarInquiry(
            name=data['name'],
            phone=data['phone'],
            make=data.get('make', 'Not Specified'),
            type=data.get('type', 'Not Specified'),
            year=year,
            condition=data.get('condition', 'Not Specified'),
            kms_driven=kms_driven,
            fuel=data.get('fuel', 'Not Specified'),
            transmission=data.get('transmission', 'Not Specified'),
            budget=data.get('budget', 'Not Specified')
        )
        
        # Save to database
        db.session.add(inquiry)
        db.session.commit()

        # Convert budget range to actual price range
        budget_ranges = {
            'below_1lac': (0, 100000),
            '1_2lac': (100000, 200000),
            '2_3lac': (200000, 300000),
            '3_5lac': (300000, 500000),
            'above_5lac': (500000, float('inf'))
        }
        
        selected_budget_range = budget_ranges.get(data['budget'], (0, float('inf')))
        
        # Filter cars based on user preferences with more flexible matching
        recommended_cars = []
        
        # First try exact matches
        exact_matches = [
            car for car in SAMPLE_CARS
            if (not data['make'] or car['make'].lower() == data['make'].lower()) and
               (not data['type'] or car['type'].lower() == data['type'].lower()) and
               (not data['year'] or car['year'] == data['year']) and
               (not data['condition'] or car['condition'].lower() == data['condition'].lower()) and
               (not data['fuel'] or car['fuel'].lower() == data['fuel'].lower()) and
               (not data['transmission'] or car['transmission'].lower() == data['transmission'].lower()) and
               (not data['kms_driven'] or car['kms_driven'] == data['kms_driven']) and
               selected_budget_range[0] <= car['price'] <= selected_budget_range[1]
        ]
        
        recommended_cars.extend(exact_matches)
        
        # If we have less than 3 exact matches, add similar cars
        if len(recommended_cars) < 3:
            # Add cars of same make but different type/year
            if data['make']:
                make_matches = [
                    car for car in SAMPLE_CARS
                    if car['make'].lower() == data['make'].lower() and
                    car not in recommended_cars and
                    selected_budget_range[0] <= car['price'] <= selected_budget_range[1]
                ]
                recommended_cars.extend(make_matches[:2])
            
            # Add cars of same type but different make
            if len(recommended_cars) < 3 and data['type']:
                type_matches = [
                    car for car in SAMPLE_CARS
                    if car['type'].lower() == data['type'].lower() and
                    car not in recommended_cars and
                    selected_budget_range[0] <= car['price'] <= selected_budget_range[1]
                ]
                recommended_cars.extend(type_matches[:2])
            
            # Add cars in same budget range
            if len(recommended_cars) < 3:
                budget_matches = [
                    car for car in SAMPLE_CARS
                    if selected_budget_range[0] <= car['price'] <= selected_budget_range[1] and
                    car not in recommended_cars
                ]
                recommended_cars.extend(budget_matches[:2])
        
        # If we still have no recommendations, return cars in similar price range
        if not recommended_cars:
            recommended_cars = sorted(
                SAMPLE_CARS,
                key=lambda x: abs(x['price'] - selected_budget_range[1])
            )[:3]
        
        return jsonify({
            'status': 'success',
            'message': 'Inquiry submitted successfully',
            'data': inquiry.to_dict(),
            'recommendations': recommended_cars
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/inquiries', methods=['GET'])
@require_api_key
def get_inquiries():
    inquiries = CarInquiry.query.order_by(CarInquiry.created_at.desc()).all()
    return jsonify([inquiry.to_dict() for inquiry in inquiries])

def init_db():
    with app.app_context():
        db.create_all()


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
