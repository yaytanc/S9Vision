/**
 * Created by Muratd on 17/11/2016.
 */

var momi_days = {
    'tr': ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    'en': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
};

var momi_months = {
    'tr': ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    'en': ['January', 'February', 'March', 'April', 'May', 'june', 'July', 'August', 'September', 'Octeber', 'November', 'December']
};

var momi;
momi = function (_datetime, _locale) {
    var d = (typeof _datetime == 'object' ? _datetime : (!_datetime ? new Date() : null));
    if (d == null) {
        d = new Date();
        var darr = _datetime.split(/[ T]/);
        var t_f = function(x) {
            return x ? x : 0;
        };
        for (var i = 0; i < darr.length; i++) {
            if (darr[i].indexOf(':') > -1) {
                var t_arr = darr[i].split(':');
                d.setHours(t_f(t_arr[0]));
                d.setMinutes(t_f(t_arr[1]));
                d.setSeconds(t_f(t_arr[2]));
            } else if (darr[i].indexOf('-') > -1) {
                var d_arr = darr[i].split('-');
                d.setFullYear(t_f(d_arr[0]));
                d.setMonth(t_f(d_arr[1]-1));
                d.setDate(t_f(d_arr[2]));
            } else throw "Wrong date/time parameter!";
        }
    }
    if (!_locale) _locale = 'tr';
    return {
        d: d,
        format: function (f) {
            if (!f) f = 'DD.MM.YYYY HH:mm:ss';
            f = f.replace(/YYYY/g, d.getFullYear());
            f = f.replace(/MMMM/g, momi_months[_locale][d.getMonth()]);
            f = f.replace(/MM/g, ('0' + (d.getMonth() + 1)).slice(-2));
            f = f.replace(/M/g, d.getMonth() + 1);
            f = f.replace(/DDDD/g, momi_days[_locale][d.getDay() - 1]);
            f = f.replace(/DD/g, ('0' + d.getDate()).slice(-2));
            // f = f.replace(/D/g, d.getDate());
            f = f.replace(/HH/g, ('0' + d.getHours()).slice(-2));
            // f = f.replace(/H/g, d.getHours());
            f = f.replace(/mm/g, ('0' + d.getMinutes()).slice(-2));
            // f = f.replace(/m/g, d.getMinutes());
            f = f.replace(/ss/g, ('0' + d.getSeconds()).slice(-2));
            // f = f.replace(/s/g, d.getSeconds());
            f = f.replace(/SS/g, ('0' + d.getMilliseconds()).slice(-2));
            // f = f.replace(/S/g, d.getMilliseconds());
            return f;
        },
        locale: function (locale) {
            return momi(this.d, locale);
        },
        add: function (value, name) {
            if (name == 'year') d.setFullYear(d.getFullYear() + value);
            if (name == 'month') d.setMonth(d.getMonth() + value);
            if (name == 'day') d.setDate(d.getDate() + value);
            if (name == 'hour') d.setHours(d.getHours() + value);
            if (name == 'minute') d.setMinutes(d.getMinutes() + value);
            if (name == 'second') d.setSeconds(d.getSeconds() + value);
            return momi(this.d, _locale);
        },
        isoWeekday: function () {
            return d.getDay();
        },
        weekday: function () {
            return d.getDay();
        },
        isBetween: function(a, b) {
            var ma = new momi(a);
            var mb = new momi(b);
            return this.d >= ma.d && this.d <= mb.d;
        },
        unix: function() {
            return this.d.valueOf();
        }
    }
};