# Written by me and ChatGPT
import requests

class FinancialDataAPI:
    def __init__(self, api_key, symbol):
        self.base_url = "https://financialmodelingprep.com/api/v3/"
        self.api_key = api_key
        self.symbol = symbol
        self.data_dict = {"annual_free_cash_flow": {}, "earnings": {}, "dividends": {}}

    def search_ticker(self):
        url = f"{self.base_url}search-ticker"
        params = {"query": self.symbol, "limit": 1, "apikey": self.api_key}
        response = requests.get(url, params=params)
        if response.status_code == 200:
            self.symbol = response.json()[0]['symbol']
        else:
            print("Failed to retrieve ticker data:", response.status_code)

    def get_cash_flow(self):
        self._get_data("cash-flow-statement", "calendarYear", "freeCashFlow", "annual_free_cash_flow")

    def get_earnings(self):
        self._get_earnings_data("historical/earning_calendar", "fiscalDateEnding", "revenue", "earnings")
    
    def get_dividends(self):
        url = f"{self.base_url}historical-price-full/stock_dividend/{self.symbol}"
        params = {"apikey": self.api_key}
        response = requests.get(url, params=params)
        if response.status_code == 200:
            dividends_data = response.json().get("historical", [])
            for entry in dividends_data:
                date = entry.get("date")
                dividend = entry.get("dividend")
                if date and dividend:
                    self.data_dict["dividends"][date] = dividend
        else:
            print("Failed to retrieve dividend data:", response.status_code)

    def _get_data(self, endpoint, key_field, value_field, data_key=None, frequency="annual"):
        url = f"{self.base_url}{endpoint}/{self.symbol}"
        params = {"apikey": self.api_key}
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data_list = response.json()
            for entry in data_list:
                key = entry.get(key_field)
                value = entry.get(value_field)
                if key and value:
                    if data_key:
                        self.data_dict[data_key][key] = value
                    else:
                        self.data_dict["annual_free_cash_flow"][key] = value
        else:
            print(f"Failed to retrieve {value_field} data:", response.status_code)

    def _get_earnings_data(self, endpoint, key_field, value_field, data_key=None):
        url = f"{self.base_url}{endpoint}/{self.symbol}"
        params = {"apikey": self.api_key}
        response = requests.get(url, params=params)
        if response.status_code == 200:
            earnings_data = response.json()
            latest_earnings = {}
            for entry in earnings_data:
                fiscal_date = entry.get(key_field)
                revenue = entry.get(value_field)
                if fiscal_date and revenue:
                    year = fiscal_date[:4]
                    if year not in latest_earnings or fiscal_date > latest_earnings[year][key_field]:
                        latest_earnings[year] = entry
            for entry in latest_earnings.values():
                fiscal_date = entry.get(key_field)
                revenue = entry.get(value_field)
                if fiscal_date and revenue:
                    fiscal_year = fiscal_date[:4]
                    if data_key:
                        self.data_dict[data_key][fiscal_year] = revenue
                    else:
                        self.data_dict["earnings"][fiscal_year] = revenue
        else:
            print(f"Failed to retrieve {value_field} data:", response.status_code)
