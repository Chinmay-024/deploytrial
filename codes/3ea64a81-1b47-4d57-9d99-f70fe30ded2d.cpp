    #include <bits/stdc++.h>
    using namespace std;
     
    typedef long long int ll;
    #define rep(i, j, n) for (int i = j; i < n; i++)
    #define vi vector<int>
    #define vvi vector<vi>
    #define pii pair<int, int>
    #define vii vector<pii>
    #define ff first
    #define ss second
     
    const ll M = 2e6 + 20;
    vector<ll> fact(M, 1);
    const int N = 1e5 + 7;
    const int MOD = 1e9 + 7;
     
    //  for (ll i = 2; i < M; i++)
    //    fact[i] = (fact[i - 1] * i) % MOD;
    // cout << fixed << setprecision(10);
    // vvi vec( n , vi (m, 0));
    // sort(arr, arr + n);
    //__gcd(m, n)
     
    ll power(ll x, ll n)
    {
        ll ans = 1;
        while (n != 0)
        {
            if (n % 2 == 1)
                ans = (ans * x) % MOD;
            x = (x * x) % MOD;
            n /= 2;
        }
        return ans % MOD;
    }
     
    ll nCr(ll n, ll r)
    {
        if (r < 0 || r > n)
            return 0;
        ll x = power(fact[r], MOD - 2);
        ll y = power(fact[n - r], MOD - 2);
        x = (x * y) % MOD;
        return (fact[n] * x) % MOD;
    }
     
    int main()
    {
        // added the two lines below
        ios_base::sync_with_stdio(false);
        cin.tie(NULL);
        int t;
        cin >> t;
        for (int qi = 0; qi < t; qi++)
        {
            ll n, ans = 0;
            string s;
     
            cin >> n;
            vi c(n);
     
            vector<int> adj[n + 1];
            rep(i, 0, n)
            {
                cin >> c[i];
                adj[c[i]].push_back(i);
            }
            for (int i = 1; i <= n; i++)
            {
                int count = 0;
                if (adj[i].size() >= 1)
                    count = 1;
                else
                {
                    cout << count << ' ';
                    continue;
                }
                for (int j = 1; j < adj[i].size(); j++)
                {
                    if ((adj[i][j] - adj[i][j - 1]) % 2 == 1)
                        count++;
                }
                cout << count << " ";
            }
            cout << "\n";
        }
        return 0;
    }