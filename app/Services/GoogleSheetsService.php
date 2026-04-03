<?php

namespace App\Services;

use App\Models\Pengaturan;
use Google\Client;
use Google\Service\Sheets;
use Google\Service\Drive;

class GoogleSheetsService
{
    private Client $client;
    private Pengaturan $pengaturan;

    public function __construct()
    {
        $this->pengaturan = Pengaturan::firstOrFail();
        $this->client = new Client();
        $this->client->setClientId($this->pengaturan->google_client_id);
        $this->client->setClientSecret($this->pengaturan->google_client_secret);
        $this->client->setRedirectUri(url('/pengaturan/google/callback'));
        $this->client->addScope(Sheets::SPREADSHEETS);
        $this->client->addScope(Drive::DRIVE_FILE);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    public function isConfigured(): bool
    {
        return !empty($this->pengaturan->google_client_id)
            && !empty($this->pengaturan->google_client_secret);
    }

    public function isAuthorized(): bool
    {
        return $this->isConfigured() && !empty($this->pengaturan->google_refresh_token);
    }

    public function getAuthUrl(): string
    {
        return $this->client->createAuthUrl();
    }

    public function handleCallback(string $code): void
    {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);
        if (isset($token['refresh_token'])) {
            $this->pengaturan->update(['google_refresh_token' => $token['refresh_token']]);
        }
    }

    private function authenticate(): void
    {
        $this->client->refreshToken($this->pengaturan->google_refresh_token);
    }

    public function exportToSheets(string $title, array $headers, array $rows): string
    {
        $this->authenticate();

        $sheetsService = new Sheets($this->client);
        $driveService = new Drive($this->client);

        // Create spreadsheet
        $spreadsheet = new Sheets\Spreadsheet([
            'properties' => ['title' => $title],
        ]);
        $spreadsheet = $sheetsService->spreadsheets->create($spreadsheet);
        $spreadsheetId = $spreadsheet->getSpreadsheetId();

        // Prepare data
        $data = [$headers, ...$rows];
        $range = 'Sheet1!A1';
        $body = new Sheets\ValueRange(['values' => $data]);
        $sheetsService->spreadsheets_values->update($spreadsheetId, $range, $body, ['valueInputOption' => 'RAW']);

        // Move to folder if configured
        $folderId = $this->pengaturan->google_drive_folder_id;
        if ($folderId) {
            $file = $driveService->files->get($spreadsheetId, ['fields' => 'parents']);
            $previousParents = implode(',', $file->getParents());
            $driveService->files->update($spreadsheetId, new Drive\DriveFile(), [
                'addParents' => $folderId,
                'removeParents' => $previousParents,
                'fields' => 'id, parents',
            ]);
        }

        return "https://docs.google.com/spreadsheets/d/{$spreadsheetId}";
    }
}
