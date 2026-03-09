<?php
// api/services/SteamService.php

class SteamService
{
    // A chave em ambiente ideal ficaria em um .env, porém para o escopo, fixamos na classe.
    private $apiKey = '8B07FE7C9405216BF61C1F439E93922B';
    private $baseUrl = 'https://api.steampowered.com';

    private function fetchFromSteam($endpoint, $params = [])
    {
        $params['key'] = $this->apiKey;
        $queryString = http_build_query($params);
        $url = "{$this->baseUrl}/{$endpoint}/?{$queryString}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        // SSL Verify false para evitar erros de certificado local no XAMPP
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            error_log("Steam API Connection Error: " . $error . " URL: " . $url);
        }

        if ($httpCode !== 200 || !$response) {
            error_log("Steam API HTTP Error Code: " . $httpCode . " URL: " . $url);
            return null;
        }

        return json_decode($response, true);
    }

    public function resolveVanityUrl($vanityName)
    {
        $data = $this->fetchFromSteam('ISteamUser/ResolveVanityURL/v0001', ['vanityurl' => $vanityName]);
        if (isset($data['response']['success']) && $data['response']['success'] == 1) {
            return $data['response']['steamid'];
        }
        return null;
    }

    public function getPlayerSummaries($steamIds)
    {
        // Aceita array ou string separada por virgula
        $ids = is_array($steamIds) ? implode(',', $steamIds) : $steamIds;
        $data = $this->fetchFromSteam('ISteamUser/GetPlayerSummaries/v0002', ['steamids' => $ids]);
        return $data['response']['players'] ?? [];
    }

    public function getOwnedGames($steamId, $includeAppInfo = true)
    {
        $params = [
            'steamid' => $steamId,
            'include_appinfo' => $includeAppInfo ? 'true' : 'false',
            'format' => 'json'
        ];
        $data = $this->fetchFromSteam('IPlayerService/GetOwnedGames/v0001', $params);
        return $data['response']['games'] ?? [];
    }

    public function getFriendList($steamId)
    {
        $data = $this->fetchFromSteam('ISteamUser/GetFriendList/v0001', ['steamid' => $steamId, 'relationship' => 'friend']);
        return $data['friendslist']['friends'] ?? [];
    }

    public function getPlayerAchievements($steamId, $appId)
    {
        $data = $this->fetchFromSteam('ISteamUserStats/GetPlayerAchievements/v0001', [
            'steamid' => $steamId,
            'appid' => $appId
        ]);
        return $data['playerstats'] ?? null;
    }

    public function getGlobalAchievementPercentages($appId)
    {
        $data = $this->fetchFromSteam('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002', [
            'gameid' => $appId
        ]);
        return $data['achievementpercentages']['achievements'] ?? [];
    }
}
?>
