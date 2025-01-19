# Written by ChatGPT with adjustments made by me
from flask import Flask, render_template, request, jsonify
from data import FinancialDataAPI

app = Flask(__name__)

API_KEY = 't0f0FJdnyj4vclpIuzv4PrIOKyDLKnKU'
DEFAULT_TICKER = 'AAPL'

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_data', methods=['GET'])
def get_data():
    ticker = request.args.get('ticker', DEFAULT_TICKER)
    
    api = FinancialDataAPI(API_KEY, ticker)
    api.search_ticker()
    api.get_cash_flow()   
    api.get_earnings()
    api.get_dividends()
    
    cash_flow_data = api.data_dict['annual_free_cash_flow']
    earnings_data = api.data_dict['earnings']
    dividends_data = api.data_dict['dividends']
    
    return jsonify(cash_flow=cash_flow_data, earnings=earnings_data, dividends=dividends_data)

if __name__ == '__main__':
    app.run(debug=True)
